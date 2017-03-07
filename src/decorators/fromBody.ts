
export function fBody() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target[propertyKey].parametersSettings) {
            target[propertyKey].parametersSettings = [];
        }

        target[propertyKey].parametersSettings[descriptor as number] = { type: "fromBody" };
    };
}