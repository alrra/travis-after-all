import pkg from './../../package.json';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const GH_TOKEN = process.env.GH_TOKEN;
const GH_USER_EMAIL = process.env.GH_USER_EMAIL;
const GH_USER_NAME = process.env.GH_USER_NAME;

const REPOSITORY_URL = `https://${GH_TOKEN}@github.com/${pkg.repository}.git`;

// ---------------------------------------------------------------------

export default {

    'NAME': pkg.repository,
    'URL': REPOSITORY_URL,
    'user': {
        'EMAIL': GH_USER_EMAIL,
        'NAME': GH_USER_NAME,
        'TOKEN': GH_TOKEN
    }

};
