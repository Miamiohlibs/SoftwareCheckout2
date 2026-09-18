const { emailSuffix } = require('../../config/miamiDam');

module.exports = {
  credentials: {
    username: 'svc-fake-api', //optional for config
    token: '12345',
  },
  baseUrl: 'https://fake.org/api',
  emailSuffix: '@fake.org',
};
