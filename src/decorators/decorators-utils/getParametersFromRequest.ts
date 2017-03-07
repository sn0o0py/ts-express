

import {
    ParameterSettings,
    QueryParameterSettings,
    UrlParameterSettings,
    InjectParameterSettings,
    EnreachedRequest
} from '../../typings';

import * as express from 'express';

export function getParametersFromRequest(req: EnreachedRequest, res: express.Response, parametersSettings: ParameterSettings[]): Array<any> {
    return parametersSettings.map((ps) => {
        switch (ps.type) {
            case 'fromBody':
                return req.body;
            case 'fromQuery':
                return (ps as QueryParameterSettings).paramType(req.query[(ps as QueryParameterSettings).paramName]);
            case 'fromUrl':
                return (ps as UrlParameterSettings).paramType(req.params[(ps as UrlParameterSettings).paramName]);
            case 'request':
                return req;
            case 'response':
                return res;
            case 'inject':
                return (ps as InjectParameterSettings).getFunction(req.container);
            default:
                throw new Error(`Unable to get parameter ${JSON.stringify(ps)}`);
        }
    });
}