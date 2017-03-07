import { inversifyContainer } from './inversifySingleContainer';
import { interfaces } from 'inversify';

export function bindConst<T>(toBindTo: interfaces.ServiceIdentifier<T>, value: T) {
    inversifyContainer.bind<T>(toBindTo).toConstantValue(value);
}