import * as ts from 'typescript';
import { ControllerGenerator } from './controllerGenerator';

export class MetadataGenerator {
  public static current: MetadataGenerator;
  public readonly nodes = new Array<ts.Node>();
  public readonly typeChecker: ts.TypeChecker;
  private readonly program: ts.Program;
  private referenceTypes: { [typeName: string]: ReferenceType } = {};
  private circularDependencyResolvers = new Array<(referenceTypes: { [typeName: string]: ReferenceType }) => void>();

  public IsExportedNode(node: ts.Node) { return true; }

  constructor(entryFile: string) {
    this.program = ts.createProgram([entryFile], {});
    this.typeChecker = this.program.getTypeChecker();
    MetadataGenerator.current = this;
  }

  public Generate(): Metadata {
    this.program.getSourceFiles().forEach(sf => {
      ts.forEachChild(sf, node => {
        this.nodes.push(node);
      });
    });

    const controllers = this.buildControllers();

    this.circularDependencyResolvers.forEach(c => c(this.referenceTypes));

    return {
      Controllers: controllers,
      ReferenceTypes: this.referenceTypes
    };
  }

  public TypeChecker() {
    return this.typeChecker;
  }

  public AddReferenceType(referenceType: ReferenceType) {
    this.referenceTypes[referenceType.name] = referenceType;
  }

  public GetReferenceType(typeName: string) {
    return this.referenceTypes[typeName];
  }

  public OnFinish(callback: (referenceTypes: { [typeName: string]: ReferenceType }) => void) {
    this.circularDependencyResolvers.push(callback);
  }

  private buildControllers() {
    return this.nodes
      .filter(node => node.kind === ts.SyntaxKind.ClassDeclaration && this.IsExportedNode(node as ts.ClassDeclaration))
      .map((classDeclaration: ts.ClassDeclaration) => new ControllerGenerator(classDeclaration))
      .filter(generator => generator.IsValid())
      .map(generator => generator.Generate());
  }
}

export interface Metadata {
  Controllers: Controller[];
  ReferenceTypes: { [typeName: string]: ReferenceType };
}

export interface Controller {
  location: string;
  methods: Method[];
  name: string;
  tagName: string;
  jwtUserProperty: string;
}

export interface Method {
  description: string;
  example: any;
  method: string;
  name: string;
  parameters: Parameter[];
  path: string;
  type: Type;
  tags: string[];
  responses: ResponseType[];
  security?: Security;
}

export interface Parameter {
  description: string;
  in: string;
  name: string;
  required: boolean;
  type: Type;
  injected?: boolean;
}

export interface Security {
  name: string;
  scopes?: string[];
}

export type Type = PrimitiveType | ReferenceType | ArrayType;

export type PrimitiveType = string;

export interface ReferenceType {
  description: string;
  name: string;
  properties: Property[];
  enum?: string[];
}

export interface ResponseType {
  description: string;
  name: string;
  schema?: Type;
}

export interface Property {
  description: string;
  name: string;
  type: Type;
  required: boolean;
}

export interface ArrayType {
  elementType: Type;
}
