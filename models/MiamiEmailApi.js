const axios = require('axios');
const logger = require('../services/logger');

module.exports = class MiamiEmailApi {
  async getUniqFromEmail(email, appendAt = true) {
    let res = await this.submitQuery(email);
    let uniq = res.data.uid;
    if (appendAt) {
      uniq += '@miamioh.edu';
    }
    return uniq;
  }
  async submitQuery(email) {
    try {
      let url =
        'https://ws.apps.miamioh.edu/api/directory/v1/query/mailLookup?q=' +
        email;
      let res = await axios(url);
      return res.data;
    } catch (err) {
      logger.error('Failed email lookup for: ' + email);
    }
  }
};
