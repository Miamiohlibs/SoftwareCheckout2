const EmailConverterApi = require('../models/EmailConvertererApi');
const utils = require('../helpers/utils');
const logger = require('../services/logger');

module.exports = class EmailConverterRepository {
  constructor(appConf) {
    this.api = new EmailConverterApi(appConf);
  }

  async getAuthoritativeEmailsBatch(emails) {
    let found = [];
    let missing = [];
    await utils.asyncForEach(emails, async (email) => {
      let res = await this.api.getAuthoritativeEmail(email);
      if (res === undefined) {
        missing.push(email);
      } else {
        found.push(res);
      }
    });
    return { authFound: found, authMissing: missing };
  }
};
