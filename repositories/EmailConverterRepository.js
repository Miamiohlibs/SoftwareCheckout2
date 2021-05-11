const EmailConverterApi = require('../models/EmailConvertererApi');
const utils = require('../helpers/utils');
const logger = require('../services/logger');
const Throttle = require('../helpers/Throttle');

module.exports = class EmailConverterRepository {
  constructor(appConf) {
    this.api = new EmailConverterApi(appConf);
    let userReqsPerCycle = 5;
    let secondsPerUserCycle = 3;
    this.lookupThrottle = new Throttle(userReqsPerCycle, secondsPerUserCycle);
  }

  async getAuthoritativeEmailsBatch(emails) {
    let found = [];
    let missing = [];
    let newMatches = [];
    await utils.asyncForEach(emails, async (email) => {
      await this.lookupThrottle.pauseIfNeeded();
      let res = await this.api.getAuthoritativeEmail(email);
      this.lookupThrottle.increment();
      if (res === undefined) {
        missing.push(email);
      } else {
        found.push(res);
        newMatches.push({ email: email, uniqEmail: res });
      }
    });
    return { authFound: found, authMissing: missing, newMatches: newMatches };
  }
};
