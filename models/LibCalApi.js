const axios = require('axios');
const logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');

/* 
public methods:
- getSoftwareCategories
- getBookings
*/

module.exports = class LibCalApi {
  constructor(conf) {
    this.conf = conf;
    this.baseUrl = conf.credentials.auth.tokenHost + '/1.1/equipment/';
    const required = ['credentials', 'softwareLocation'];
    required.forEach((element) => {
      if (!this.conf.hasOwnProperty(element)) {
        throw new Error('LibCalApi missing required property: ' + element);
      }
    });
  }

  async getSoftwareCategories() {
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl + 'categories/' + this.conf.softwareLocation;
    this.queryConf.method = 'get';
    return await this.getQueryResults();
  }

  async getBookings(cid, date = null, days = null) {
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl +
      'bookings/?limit=500&lid=' +
      this.conf.softwareLocation +
      '&cid=' +
      cid;
    if (date !== null) {
      this.queryConf.url += '&date=' + date;
    }
    if (days !== null) {
      this.queryConf.url += '&days=' + days;
    }
    this.queryConf.method = 'get';
    let res = await this.getQueryResults();
    logger.debug('LibCal API response status', res);
    logger.debug(
      `LibCal API received getBookings for ${cid}`,
      axiosLogPrep(res)
    );
    return res;
  }

  async getQueryResults() {
    if (!this.hasOwnProperty('accessToken')) {
      logger.debug('LibCalApi getting access token before getQueryResults');
      await this.getToken();
    }
    this.queryConf.headers = this.getAuthHeaders();
    logger.debug('LibCalApi getQueryResults with queryConf', {
      content: this.queryConf,
    });
    try {
      let res = await axios.request(this.queryConf);
      let log = axiosLogPrep(res);
      logger.debug('LibCalApi Received query results', { content: log });
      return res.data;
    } catch (err) {
      let log = axiosLogPrep(err);
      let status = err.response.status;
      logger.error(`Failed LibCalApi query with status ${status}`, {
        status,
        content: log,
      });
    }
  }

  async getToken() {
    const oauth2 = require('simple-oauth2').create(this.conf.credentials);
    try {
      const result = await oauth2.clientCredentials.getToken();
      this.accessToken = result.access_token;
      logger.debug(`LibCalApi Token: ${this.accessToken}`);
      return true;
    } catch (err) {
      logger.error(`LibCalApi Access Token Error: ${err.message}`, {
        content: err,
      });
    }
  }

  clearQueryConf() {
    this.queryConf = {};
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
};
