const axios = require('axios');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('AdobeApi');
const { axiosLogPrep } = require('../helpers/utils');

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
      let tokenResponse = await this.executeTokenQuery();
      this.accessToken = tokenResponse.access_token;
    } catch (err) {
      console.log('Failed to get Adobe token in:', __filename);
      console.log(err);
    }
  }

  async executeTokenQuery() {
    try {
      let baseUrl = 'https://ims-na1.adobelogin.com/ims/token/v2';
      let grantType = 'client_credentials';
      let scope = 'openid,AdobeID,user_management_sdk';

      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

      var urlencoded = new URLSearchParams();
      urlencoded.append('grant_type', grantType);
      urlencoded.append('client_id', this.credentials.clientId);
      urlencoded.append('client_secret', this.credentials.clientSecret);
      urlencoded.append('scope', scope);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
      };

      let res = await fetch(baseUrl, requestOptions);
      return await res.json();
    } catch (err) {
      console.log('Failed to execute Adobe token query in:', __filename);
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
      console.log(('Failed Adobe query:', axiosLogPrep(err)));
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': `${this.credentials.clientId}`,
    };
  }
};
