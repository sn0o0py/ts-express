export function response() {
    return function response(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target[propertyKey].parametersSettings) {
            target[propertyKey].parametersSettings = [];
        }

        target[propertyKey].parametersSettings[descriptor as number] = { type: "response" };
    };
}