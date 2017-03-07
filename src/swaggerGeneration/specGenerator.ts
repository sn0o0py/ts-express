import { SwaggerConfig } from './config';
import { Metadata, Type, ArrayType, ReferenceType, PrimitiveType, Property, Method, Parameter, ResponseType } from '../metadataGeneration/metadataGenerator';
import { Swagger } from './swagger';

export class SpecGenerator {
  constructor(private readonly metadata: Metadata, private readonly config: SwaggerConfig) { }

  public GenerateSpec(swaggerDir: string): Swagger.Spec {
    return this.GetSpec();
  }

  public GetSpec() {
    let spec: Swagger.Spec = {
      basePath: this.config.basePath,
      consumes: ['application/json'],
      definitions: this.buildDefinitions(),
      info: {},
      paths: this.buildPaths(),
      produces: ['application/json'],
      swagger: '2.0',
    };

    const securityDefinitions = this.config.securityDefinitions
      ? this.config.securityDefinitions
      : {};

    // Check if we have jwt enabled api
    if (this.metadata.Controllers.some((controller) => controller.jwtUserProperty !== '')) {
      Object.assign(securityDefinitions, this.buildJwtSecurityDefinition());
    }
    spec.securityDefinitions = securityDefinitions;

    if (this.config.description) { spec.info.description = this.config.description; }
    if (this.config.license) { spec.info.license = { name: this.config.license }; }
    if (this.config.name) { spec.info.title = this.config.name; }
    if (this.config.version) { spec.info.version = this.config.version; }
    if (this.config.host) { spec.host = this.config.host; }

    if (this.config.spec) {
      this.config.specMerging = this.config.specMerging || 'immediate';
      const mergeFuncs: { [key: string]: Function } = {
        immediate: Object.assign,
        recursive: require('merge').recursive,
      };

      spec = mergeFuncs[this.config.specMerging](spec, this.config.spec);
    }

    return spec;
  }

  private buildDefinitions() {
    const definitions: { [definitionsName: string]: Swagger.Schema } = {};
    Object.keys(this.metadata.ReferenceTypes).map(typeName => {
      const referenceType = this.metadata.ReferenceTypes[typeName];
      definitions[referenceType.name] = {
        description: referenceType.description,
        properties: this.buildProperties(referenceType.properties),
        required: referenceType.properties.filter(p => p.required).map(p => p.name),
        type: 'object'
      };
      if (referenceType.enum) {
        definitions[referenceType.name].type = 'string';
        delete definitions[referenceType.name].properties;
        delete definitions[referenceType.name].required;
        definitions[referenceType.name].enum = referenceType.enum as [string];
      }
    });

    return definitions;
  }

  private buildJwtSecurityDefinition() {
    return {
      'Bearer': <Swagger.ApiKeySecurity>{
        description: 'JWT token with bearer word in front of it',
        in: 'header',
        name: 'Authorization',
        type: 'apiKey'
      }
    };
  }

  private buildPaths() {
    const paths: { [pathName: string]: Swagger.Path } = {};

    this.metadata.Controllers.forEach(controller => {
      controller.methods.forEach(method => {
        const path = `${method.path}`;
        paths[path] = paths[path] || {};
        this.buildPathMethod(method, paths[path], controller.jwtUserProperty, controller.tagName);
      });
    });

    return paths;
  }

  private buildPathMethod(method: Method, pathObject: any, jwtUserProperty: string, tag: string) {
    const pathMethod: any = pathObject[method.method] = this.buildOperation(method);
    pathMethod.description = method.description;
    pathMethod.parameters = method.parameters.filter(p => !p.injected).map(p => this.buildParameter(p));

    pathMethod.tags = [tag];

    const security = new Array<any>();
    if (jwtUserProperty !== '') {
      security.push({
        'Bearer': []
      });
    }

    if (method.security) {
      const methodSecurity: any = {};
      methodSecurity[method.security.name] = method.security.scopes ? method.security.scopes : [];
      security.push(methodSecurity);
    }
    if (security.length > 0) { pathMethod.security = security; }

    if (pathMethod.parameters.filter((p: Swagger.BaseParameter) => p.in === 'body').length > 1) {
      throw new Error('Only one body parameter allowed per controller method.');
    }
  }

  private buildParameter(parameter: Parameter) {
    const swaggerParameter: any = {
      description: parameter.description,
      in: parameter.in,
      name: parameter.name,
      required: parameter.required
    };

    const parameterType = this.getSwaggerType(parameter.type);
    if (parameterType.$ref) {
      swaggerParameter.schema = parameterType;
    } else {
      swaggerParameter.type = parameterType.type;
    }

    if (parameterType.format) { swaggerParameter.format = parameterType.format; }

    return swaggerParameter;
  }

  private buildProperties(properties: Property[]) {
    const swaggerProperties: { [propertyName: string]: Swagger.Schema } = {};

    properties.forEach(property => {
      const swaggerType = this.getSwaggerType(property.type);
      if (!swaggerType.$ref) {
        swaggerType.description = property.description;
      }
      swaggerProperties[property.name] = swaggerType;
    });

    return swaggerProperties;
  }

  private buildOperation(method: Method) {
    const swaggerType = this.getSwaggerType(method.type);
    const responses: any = {};

    method.responses.forEach((res: ResponseType) => {
      responses[res.name] = {
        description: res.description
      };
      if (res.schema) {
        responses[res.name]['schema'] = this.getSwaggerType(res.schema);
      }
    });

    if (swaggerType.type !== 'void') {
      responses['200'] = { description: '', schema: swaggerType };
      if (method.example) {
        responses['200']['examples'] = { 'application/json': method.example };
      }
    } else {
      responses['204'] = { description: 'No content' };
    }

    return {
      operationId: method.name,
      produces: ['application/json'],
      responses: responses
    };
  }

  private getSwaggerType(type: Type) {
    if (typeof type === 'string' || type instanceof String) {
      return this.getSwaggerTypeForPrimitiveType(type as PrimitiveType);
    }

    const arrayType = type as ArrayType;
    if (arrayType.elementType) {
      return this.getSwaggerTypeForArrayType(arrayType);
    }

    return this.getSwaggerTypeForReferenceType(type as ReferenceType);
  }

  private getSwaggerTypeForPrimitiveType(primitiveTypeName: PrimitiveType) {
    const typeMap: { [name: string]: Swagger.Schema } = {
      boolean: { type: 'boolean' },
      buffer: { type: 'string', format: 'base64' },
      datetime: { format: 'date-time', type: 'string' },
      number: { format: 'int64', type: 'integer' },
      object: { type: 'object' },
      string: { type: 'string' },
      void: { type: 'void' }
    };

    return typeMap[primitiveTypeName];
  }

  private getSwaggerTypeForArrayType(arrayType: ArrayType): Swagger.Schema {
    const elementType = arrayType.elementType;

    return { items: this.getSwaggerType(elementType), type: 'array' };
  }

  private getSwaggerTypeForReferenceType(referenceType: ReferenceType): Swagger.Schema {
    return { $ref: `#/definitions/${referenceType.name}` };
  }
}
