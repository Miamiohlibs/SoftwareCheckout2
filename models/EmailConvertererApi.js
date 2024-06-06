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
        { content: err, status: err.response.status }
      );
    }
  }
  async getAuthoritativeEmail(email) {
    let res = await this.submitQuery(email);
    let uniq = _.get(res, this.objectPropForReturnValue);
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
