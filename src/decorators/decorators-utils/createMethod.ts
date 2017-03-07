
import { getApp } from '../../appContainer';
import { getParametersFromRequest } from './/getParametersFromRequest';
import * as express from 'express';


import {
    EnreachedRequest,
    ClassMiddlewareDescriptor,
    MiddlewareDescriptor,
    ClassicMiddlewareDescriptor,
    validteParameterFunction,
    IMiddleware
} from '../../typings';

export function createMethod(method: string, ...validateParameters: validteParameterFunction[]) {
    return function (url: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

            let parametersSettings = descriptor.value.parametersSettings || [];

            for (let i = 0; i < parametersSettings.length; i++) {
                if (!parametersSettings[i]) {
                    throw new Error("each parameter must have atleast one of the decorators fromBody , fromQuery , fromUrl , request , inject");
                }
            }

            validateParameters.forEach((vf) => { vf(parametersSettings); });

            let expressUrl = url.replace(/{/g, ':').replace(/}/g, '');

            (getApp() as any)[method](expressUrl, (req: EnreachedRequest, res: express.Response, next: express.NextFunction) => {

                if (target.constructor.parametersSettings) {
                    for (let i = 0; i < target.constructor.parametersSettings.length; i++) {
                        if (!target.constructor.parametersSettings[i]) {
                            throw new Error("each parameter must have atleast one of the decorators fromBody , fromQuery , fromUrl , request , inject");
                        }
                    }
                }


                let middlewares = [].concat((target.constructor.middlewares || [])
                    .reduce((p: MiddlewareDescriptor[], c: MiddlewareDescriptor[]) => { return p.concat(c); }, []))
                    .concat(target[propertyKey].middlewares || []);

                let middlewaresPromise: Promise<void> = promisifyMiddlewares(middlewares, req, res);

                middlewaresPromise.then(() => {
                    if (!res.finished) {
                        let parameters = getParametersFromRequest(req, res, target.constructor.parametersSettings || []);
                        let controller = new target.constructor(...parameters);

                        return descriptor.value.apply(controller, getParametersFromRequest(req, res, parametersSettings));
                    }
                }).then((data) => {
                    if (!res.finished) {
                        res.status(200).json(data);
                    }
                }, (err) => {
                    if (!res.finished) {
                        res.status(err.status || 500).json({
                            message: err.message,
                            stack: err.stack
                        });
                    }
                });
            });
        };
    };
}


function promisifyMiddlewares(middlewares: MiddlewareDescriptor[], req: EnreachedRequest, res: express.Response) {
    let promiseChain = Promise.resolve();
    middlewares.forEach((mw) => {
        promiseChain = promiseChain.then(() => {
            if (res.finished) {
                return Promise.resolve();
            }
            else {
                return promisifyMiddleware(mw, req, res);
            }
        });
    });
    return promiseChain;
}

function promisifyMiddleware(middleware: MiddlewareDescriptor, req: EnreachedRequest, res: express.Response): Promise<void> {
    if (middleware.type === "classic") {
        return new Promise<void>((resolve, reject) => {
            try {
                (middleware as ClassicMiddlewareDescriptor).mw(req, res, (err: Error) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    if (middleware.type === "class") {
        let mwClassInstance: IMiddleware = req.container.get((middleware as ClassMiddlewareDescriptor<IMiddleware>).ctor);
        return mwClassInstance.apply();
    }
    throw new Error("Middleware type is not supported");
}