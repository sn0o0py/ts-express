
import { interfaces } from 'inversify';

export function fInject(typeToInject: interfaces.ServiceIdentifier<any>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        let parametersSettings;
        if (propertyKey) {
            if (!target[propertyKey].parametersSettings) {
                target[propertyKey].parametersSettings = [];
            }
            parametersSettings = target[propertyKey].parametersSettings;
        }
        else {
            if (!target.parametersSettings) {
                target.parametersSettings = [];
            }
            parametersSettings = target.parametersSettings;
        }

        parametersSettings[descriptor as number] = {
            type: "inject", getFunction: (container: interfaces.Container) => {
                return container.get(typeToInject);
            }
        };
    };
}
