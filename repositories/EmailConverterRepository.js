const EmailConverterApi = require('../models/EmailConverterApi');
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
    // found = array of emails we found matches for
    // missing = array of emails with no match
    // newMatches = array of pairs: email & uniqEmail
    logger.debug('EmailConverterRepo: getAuthoritativeEmailsBatch returns', {
      content: { found: found, missing: missing, newMatches: newMatches },
    });
    return { authFound: found, authMissing: missing, newMatches: newMatches };
  }

  async updateObjectsWithAuthEmails(objects, key) {
    let found = [];
    let missing = [];
    let newMatches = [];
    await utils.asyncForEach(objects, async (obj) => {
      let objCopy = obj;
      let email = obj[key];
      await this.lookupThrottle.pauseIfNeeded();
      let res = await this.api.getAuthoritativeEmail(email).catch((err) => {
        logger.log('EmailConverterRepo: failed to lookup email in API', {
          content: { error: err, email: email },
        });
      });
      this.lookupThrottle.increment();
      if (res === undefined) {
        missing.push(obj);
      } else {
        objCopy[key] = res;
        found.push(objCopy);
        newMatches.push({ email: email, uniqEmail: res });
      }
    });
    return {
      authFound: found,
      authMissing: missing,
      newMatches: newMatches,
    };
  }
};
