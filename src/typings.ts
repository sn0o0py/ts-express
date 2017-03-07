
import { interfaces } from 'inversify';
import * as express from 'express';

export interface EnreachedRequest extends express.Request {
    container?: interfaces.Container;
}

export interface IMiddleware {
    apply(): Promise<void>;
}

export interface MiddlewareDescriptor {
    type: "classic" | "class";
}

export interface ClassicMiddlewareDescriptor extends MiddlewareDescriptor {
    mw: express.RequestHandler;
}

export interface ClassMiddlewareDescriptor<T> extends MiddlewareDescriptor {
    ctor: interfaces.ServiceIdentifier<T>;
}

export interface ParameterSettings {
    type: string;
}

export interface InjectParameterSettings extends ParameterSettings {
    getFunction: Function;
}

export interface QueryParameterSettings extends ParameterSettings {
    paramType: Function;
    paramName: string;
}

export interface UrlParameterSettings extends ParameterSettings {
    paramType: Function;
    paramName: string;
}

export type validteParameterFunction = (parametersSettings: ParameterSettings[]) => void;
