const axios = require('axios');
const _ = require('lodash');
const logger = require('../services/logger');

module.exports = class EmailConverterApi {
  constructor(conf) {
    try {
      this.baseUrl = conf.emailConverter.baseUrl;
      this.endOfUrl = conf.emailConverter.endOfUrl;
      this.objectPropForReturnValue =
        conf.emailConverter.objectPropForReturnValue;
      this.affixSuffixToReturn = conf.emailConverter.affixSuffixToReturn;
      this.suffix = conf.emailConverter.suffix;
    } catch (err) {
      logger.error(
        'EmailConverterApi: Failed to set EmailConverterApi configs',
        { content: err }
      );
    }
  }
  async getAuthoritativeEmail(email) {
    // get authoritative email from email converter, return it as a fully qualified email address
    // e.g. converts my.email.alias@xyz.com to my.unique.id@xyz.com
    logger.debug(`EmailConverterApi: Getting authoritative email for ${email}`);
    let res = await this.submitQuery(email);
    let uniq = _.get(res, this.objectPropForReturnValue); // gets a deep value from response object
    if (this.affixSuffixToReturn && uniq !== undefined) {
      uniq += this.suffix;
    }
    return uniq; // value or undefined
  }

  async submitQuery(email) {
    let url = this.baseUrl + email + this.endOfUrl;
    logger.debug('EmailConverterApi: Requesting url', { content: url });
    try {
      let res = await axios(url);
      logger.debug('EmailConverterApi: Email converter results', {
        content: res.data,
      });
      return res.data;
    } catch (err) {
      logger.error(`EmailConverterApi: Failed email lookup for ${email}`);
    }
  }
};
