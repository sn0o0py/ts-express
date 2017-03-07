

import * as express from 'express';
import { containerMiddleware } from './containerMiddleware';
import { Swagger } from './swaggerGeneration/swagger';
import * as bodyParser from 'body-parser';

let app: express.Application;

export function setApp(expressApp: express.Application, swaggerJson?: Swagger.Spec): void {
    if (app) {
        throw new Error('App is already set');
    }

    app = expressApp;

    app.use(containerMiddleware);
    app.use(bodyParser.json());

    if (swaggerJson) {
        app.get('/swagger.json', (req, res) => {
            res.status(200).json(swaggerJson);
        });
    }
}

export function getApp(): express.Application {
    if (!app) {
        throw new Error('App must be set in order to get it');
    }
    return app;
}