
export function request() {
    return function request(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target[propertyKey].parametersSettings) {
            target[propertyKey].parametersSettings = [];
        }

        target[propertyKey].parametersSettings[descriptor as number] = { type: "request" };
    };
}