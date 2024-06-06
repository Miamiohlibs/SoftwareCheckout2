const axios = require('axios');
const path = require('path');
const fs = require('fs');
// const debug = require('debug')('AdobeApi');
const logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');
const fetch = require('node-fetch');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.credentials = conf.credentials;
  }

  async getToken() {
    try {
      let tokenResponse = await this.executeTokenQuery();
      this.accessToken = tokenResponse.access_token;
    } catch (err) {
      logger.error('AdobeApi failed to get Adobe token: ', err);
    }
  }

  async executeTokenQuery() {
    try {
      let baseUrl = 'https://ims-na1.adobelogin.com/ims/token/v2';
      let grantType = 'client_credentials';
      let scope = 'openid,AdobeID,user_management_sdk';

      var myHeaders = new fetch.Headers();
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
      logger.error('AdobeAPI: Failed to execute Adobe token query', err);
    }
  }
  async getQueryResults(queryConf) {
    if (!this.hasOwnProperty('accessToken')) {
      logger.debug('AdobeAPI: getting access token before getQueryResults');
      await this.getToken();
    }
    logger.debug('AdobeAPI: starting getQueryResults', queryConf);
    queryConf.headers = this.getAuthHeaders();
    try {
      let res = await axios(queryConf);
      return res.data;
    } catch (err) {
      logger.error('Failed Adobe query:', axiosLogPrep(err));
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': `${this.credentials.clientId}`,
    };
  }
};
