import { MetadataGenerator, Parameter, Type } from './metadataGenerator';
import { ResolveType } from './resolveType';
import * as ts from 'typescript';

export class ParameterGenerator {
  constructor(
    private readonly parameter: ts.ParameterDeclaration
  ) { }

  public Generate(): Parameter {
    const parameterIdentifier = this.parameter.name as ts.Identifier;
    const decorators = this.getDecorators(identifier => {
      return this.getValidInjectors().some(m => m === identifier.text);
    });
    if (!decorators || decorators.length === 0) {
      throw new Error("each parameter must have decorator");
    }

    if ((decorators as ts.Identifier[]).length > 1) {
      throw new Error(`each parameter must have only one decorator . Found: ${decorators.map(d => d.text).join(', ')}`);
    }

    let decorator = (decorators as ts.Identifier[])[0];

    switch (decorator.text) {
      case 'fBody':
        return this.getBodyParameter(this.parameter);
      case 'fQuery':
        return this.getQueryParameter(this.parameter);
      case 'fUrl':
        return this.getPathParameter(this.parameter);
      default:
        return {
          description: this.getParameterDescription(this.parameter),
          in: 'inject',
          injected: true,
          name: parameterIdentifier.text,
          required: !this.parameter.questionToken,
          type: 'object'
        };
    }

    // if (injectDecorators && injectDecorators.length === 1) {
    //   return {
    //     description: this.getParameterDescription(this.parameter),
    //     in: 'inject',
    //     injected: <InjectType>injectDecorators[0].text.toLowerCase(),
    //     name: parameterIdentifier.text,
    //     required: !this.parameter.questionToken,
    //     type: 'object'
    //   };
    // }

    // if (this.path.includes(`${parameterIdentifier.text}`)) {
    //   return this.getPathParameter(this.parameter);
    // }

    // if (this.supportsBodyParameters(this.method)) {
    //   try {
    //     return this.getQueryParameter(this.parameter);
    //   } catch (err) {
    //     if (err instanceof InvalidParameterException) {
    //       return this.getBodyParameter(this.parameter);
    //     }

    //     throw err;
    //   }
    // }

    // return this.getQueryParameter(this.parameter);
  }

  private getBodyParameter(parameter: ts.ParameterDeclaration) {
    const type = this.getValidatedType(parameter);
    const identifier = parameter.name as ts.Identifier;

    return {
      description: this.getParameterDescription(parameter),
      in: 'body',
      name: identifier.text,
      required: !parameter.questionToken,
      type: type
    };
  }

  private getQueryParameter(parameter: ts.ParameterDeclaration) {
    const type = this.getValidatedType(parameter);
    const identifier = parameter.name as ts.Identifier;

    if (!this.isPathableType(type)) {
      throw new InvalidParameterException(`Parameter '${identifier.text}' can't be passed as a query parameter.`);
    }

    return {
      description: this.getParameterDescription(parameter),
      in: 'query',
      name: identifier.text,
      required: !parameter.questionToken,
      type: type
    };
  }

  private getPathParameter(parameter: ts.ParameterDeclaration) {
    const type = this.getValidatedType(parameter);
    const identifier = parameter.name as ts.Identifier;

    if (!this.isPathableType(type)) {
      throw new InvalidParameterException(`Parameter '${identifier.text}' can't be passed as a path parameter.`);
    }

    return {
      description: this.getParameterDescription(parameter),
      in: 'path',
      name: identifier.text,
      // TODISCUSS: Path parameters should always be required...right?
      // Apparently express doesn't think so, but I think being able to
      // have combinations of required and optional path params makes behavior
      // pretty confusing to clients
      required: true,
      type: type
    };
  }

  private getParameterDescription(node: ts.ParameterDeclaration) {
    const symbol = MetadataGenerator.current.typeChecker.getSymbolAtLocation(node.name);

    const comments = symbol.getDocumentationComment();
    if (comments.length) { return ts.displayPartsToString(comments); }

    return '';
  }

  // private supportsBodyParameters(method: string) {
  //   return ['post', 'put', 'patch'].some(m => m === method.toLowerCase());
  // }

  private isPathableType(parameterType: Type) {
    if (!(typeof parameterType === 'string' || parameterType instanceof String)) {
      return false;
    }

    const type = parameterType as string;
    return !!['string', 'boolean', 'number', 'datetime', 'buffer'].find(t => t === type);
  }

  private getValidatedType(parameter: ts.ParameterDeclaration) {
    if (!parameter.type) { throw new Error(`Parameter ${parameter.name} doesn't have a valid type assigned.`); }
    return ResolveType(parameter.type);
  }

  private getDecorators(isMatching: (identifier: ts.Identifier) => boolean) {
    const decorators = this.parameter.decorators;
    if (!decorators || !decorators.length) { return undefined; }

    return decorators
      .map(d => d.expression as ts.CallExpression)
      .map(e => e.expression as ts.Identifier)
      .filter(isMatching);
  }

  private getValidInjectors() {
    return ['fUrl', 'fBody', 'fQuery', 'request', 'response', 'fInject'];
  }
}

class InvalidParameterException extends Error { }
