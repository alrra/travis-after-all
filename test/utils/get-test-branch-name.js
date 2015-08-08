import path from 'path';

import pkg from './../../package.json';
import travis from './travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const PREFIX = `${pkg['_configs']['test-branch-prefix']}_${travis.getCurrentBuildID()}`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (baseName) =>
    `${PREFIX}_${baseName}`;
