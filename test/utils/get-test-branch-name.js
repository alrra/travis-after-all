import pkg from './../../package.json';

import travis from './travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const PREFIX = `${pkg['config']['test-branch-prefix']}_${travis.getCurrentBuildID()}`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (baseName) =>
    `${PREFIX}_${baseName}`;
