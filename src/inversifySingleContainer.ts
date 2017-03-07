import { Container, inject, interfaces } from 'inversify';
import { makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators';

let inversifyContainer = new Container();

let provide = makeProvideDecorator(inversifyContainer);
let fluentProvider = makeFluentProvideDecorator(inversifyContainer);

let provideSingleton = function(
  identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>
) {
    return fluentProvider(identifier)
      .inSingletonScope()
      .done();
};

export { inversifyContainer, provide, provideSingleton, inject };