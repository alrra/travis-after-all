import pkg from './../../package.json';

import * as travis from './travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const PREFIX = `${pkg['config']['test-branch-prefix']}-${travis.getCurrentBuildID()}`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (baseName) =>
    `${PREFIX}-${baseName}`;
