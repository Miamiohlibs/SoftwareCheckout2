const Debug = require('debug');
const debug = new Debug('AdobeApi');
const axios = require('axios');
const e = require('express');

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

  async getBookings(cid) {
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl +
      'bookings/?limit=500&lid=' +
      this.conf.softwareLocation +
      '&cid=' +
      cid;
    this.queryConf.method = 'get';
    return await this.getQueryResults();
  }

  async getQueryResults() {
    if (!this.hasOwnProperty('accessToken')) {
      debug('getting access token before getQueryResults');
      await this.getToken();
    }
    this.queryConf.headers = this.getAuthHeaders();
    try {
      let res = await axios.request(this.queryConf);
      return res.data;
    } catch (err) {
      console.log(('Failed LibCal query:', err));
    }
  }

  async getToken() {
    const oauth2 = require('simple-oauth2').create(this.conf.credentials);
    try {
      const result = await oauth2.clientCredentials.getToken();
      this.accessToken = result.access_token;
      debug('LibCal Token: ' + this.accessToken);
      return true;
    } catch (err) {
      console.error('LibCalAccess Token Error:', err.message);
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
