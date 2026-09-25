const assert = require('node:assert/strict');
const auth = require('../server/controllers/authController');

assert.equal(typeof auth.register, 'function');
assert.equal(typeof auth.login, 'function');
assert.equal(typeof auth.forgot, 'function');
assert.equal(typeof auth.reset, 'function');
assert.equal('verifyEmail' in auth, false);
assert.equal('resendVerification' in auth, false);

console.log('auth email recovery exports ok');
