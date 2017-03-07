

import { createMethod } from './decorators-utils/createMethod';

import { validateNoBody } from './decorators-utils/validateNoBody';

export const get = createMethod('get', validateNoBody);
