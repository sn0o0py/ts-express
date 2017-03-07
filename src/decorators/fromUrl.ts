

export function fUrl(paramName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target[propertyKey].parametersSettings) {
            target[propertyKey].parametersSettings = [];
        }

        target[propertyKey].parametersSettings[descriptor as number] = {
            type: "fromUrl",
            paramName,
            paramType: Reflect.getMetadata("design:paramtypes", target, propertyKey)[descriptor as number]
        };
    };
}