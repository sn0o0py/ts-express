

import { createMethod } from './decorators-utils/createMethod';

import { validateNoBody } from './decorators-utils/validateNoBody';

export const del = createMethod('delete', validateNoBody);
