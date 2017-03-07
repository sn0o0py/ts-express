
import { ParameterSettings } from '../../typings';

export function validateNoBody(parametersSettings: ParameterSettings[]) {
    for (let i = 0; i < parametersSettings.length; i++) {
        if (parametersSettings[i].type === 'fromBody') {
            throw new Error("get method does not accept body parameter");
        }
    }
}