
import * as express from 'express';

import { interfaces } from 'inversify';

interface MiddlewareDecriptor {
    type: string;
    mw?: express.RequestHandler;
    ctor?: interfaces.Newable<any>;
}

export function applyMiddleware(mw: express.RequestHandler) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let reqHandler = target[propertyKey];

        if (!reqHandler.middlewares) {
            reqHandler.middlewares = [];
        }

        reqHandler.middlewares = [{ type: "classic", mw }].concat(reqHandler.middlewares);
    };
}


export function applyAllMiddleware(mw: express.RequestHandler) {
    return function (controller: any) {

        if (controller.__proto__.middlewares &&
            controller.middlewares.length === controller.__proto__.middlewares.length) {
            Object.assign(controller, {
                middlewares: ([] as Array<Array<MiddlewareDecriptor>>).concat(controller.middlewares).concat([[]])
            });
        }
        else {
            if (!controller.middlewares) {
                controller.middlewares = [[]];
            }
        }
        controller.middlewares[controller.middlewares.length - 1].splice(0, 0, { type: "classic", mw });
    };
}

export function applyMiddlewareClass(ctor: interfaces.Newable<any>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let reqHandler = target[propertyKey];

        if (!reqHandler.middlewares) {
            reqHandler.middlewares = [];
        }

        reqHandler.middlewares = [{ type: "class", ctor }].concat(reqHandler.middlewares);
    };
}

export function applyAllMiddlewareClass(ctor: interfaces.Newable<any>) {
    return function (controller: any) {

        if (controller.__proto__.middlewares &&
            controller.middlewares.length === controller.__proto__.middlewares.length) {
            Object.assign(controller, {
                middlewares: ([] as Array<Array<MiddlewareDecriptor>>).concat(controller.middlewares).concat([[]])
            });
        }
        else {
            if (!controller.middlewares) {
                controller.middlewares = [[]];
            }
        }

        controller.middlewares[controller.middlewares.length - 1].splice(0, 0, { type: "class", ctor });
    };
}