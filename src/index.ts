
import 'reflect-metadata';

import { getApp, setApp } from './appContainer';

import { get } from './decorators/get';
import { put } from './decorators/put';
import { del } from './decorators/delete';
import { post } from './decorators/post';
import { request } from './decorators/request';
import { response } from './decorators/response';
import { fBody } from './decorators/fromBody';
import { fUrl } from './decorators/fromUrl';
import { fQuery } from './decorators/fromQuery';
import { fInject } from './decorators/inject';
import { provide, provideSingleton } from './inversifySingleContainer';
import { applyMiddleware, applyAllMiddleware, applyMiddlewareClass, applyAllMiddlewareClass } from './decorators/applyMiddleware';
import { MetadataGenerator } from './metadataGeneration/metadataGenerator';
import { Controller } from './decorators/controller';
import { SpecGenerator } from './swaggerGeneration/specGenerator';
import { Swagger } from './swaggerGeneration/swagger';
import { inject } from 'inversify';
import { bindConst } from './bindConst';

import * as interfaces from './typings';


export {
    get,
    put,
    del,
    post,
    request,
    response,
    getApp,
    setApp,
    fBody,
    fUrl,
    fQuery,
    provide,
    provideSingleton,
    fInject,
    applyMiddleware,
    applyAllMiddleware,
    applyMiddlewareClass,
    applyAllMiddlewareClass,
    MetadataGenerator,
    Controller,
    SpecGenerator,
    Swagger,
    inject,
    interfaces,
    bindConst
}