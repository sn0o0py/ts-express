
import * as express from 'express';
import { Container } from 'inversify';
import { inversifyContainer } from './inversifySingleContainer';
import { interfaces } from 'inversify';
import { EnreachedRequest } from './typings';

export function containerMiddleware(req: EnreachedRequest, res: express.Response, next: express.NextFunction): void {
    let container: interfaces.Container = new Container();

    container.bind<express.Request>("request").toConstantValue(req);
    container.bind<express.Response>("response").toConstantValue(res);

    container = Container.merge(container, inversifyContainer);

    req.container = container;

    next();
}

