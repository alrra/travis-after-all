import crypto from 'crypto';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (text, key) =>
    crypto.createHmac('sha256', key).update(`${text}`).digest('hex');
