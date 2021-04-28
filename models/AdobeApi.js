// const Query = require('./Query');
const axios = require('axios');
const jwtAuth = require('@adobe/jwt-auth');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('AdobeApi');

// const { queryConf } = require('../config/adobe');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.credentials = conf.credentials;
    this.addPrivateKeyToCredentials(conf);
  }

  addPrivateKeyToCredentials(conf) {
    this.credentials.privateKey = fs.readFileSync(
      path.join(__dirname, conf.certs.privateKeyFile),
      'utf8'
    );
  }

  async getToken() {
    try {
      let tokenResponse = await jwtAuth(this.credentials);
      this.accessToken = tokenResponse.access_token;
    } catch (err) {
      console.log('Failed to get Adobe token in:', __filename);
      console.log(err);
    }
  }

  async getQueryResults(queryConf) {
    if (!this.hasOwnProperty('accessToken')) {
      debug('getting access token before getQueryResults');
      await this.getToken();
    }
    debug('starting getQueryResults', queryConf);
    queryConf.headers = this.getAuthHeaders();
    try {
      let res = await axios(queryConf);
      return res.data;
    } catch (err) {
      console.log(('Failed Adobe query:', err));
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': `${this.credentials.clientId}`,
    };
  }
};
