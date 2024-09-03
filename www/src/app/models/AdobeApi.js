const axios = require('axios');
const path = require('path');
const fs = require('fs');
// const logger = require('../services/logger');
// const { axiosLogPrep } = require('@/app/helpers/utils');

class AdobeUserMgmtApi {
  constructor(conf) {
    this.credentials = conf.credentials;
  }

  async getToken() {
    try {
      let tokenResponse = await this.executeTokenQuery();
      console.log('AdobeAPI: tokenResponse', { content: tokenResponse });
      this.accessToken = tokenResponse.access_token;
      //   this.accessToken = 'test';
    } catch (err) {
      console.error(`AdobeApi failed to get Adobe token: ${err.message}`, {
        content: err,
        // status: err.response.status,
      });
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
      //   console.log(
      //     'AdobeAPI: executeTokenQuery;',
      //     'baseUrl',
      //     baseUrl,
      //     'options',
      //     requestOptions
      //   );
      let res = await fetch(baseUrl, requestOptions);
      return await res.json();
    } catch (err) {
      console.error(
        `AdobeAPI: Failed to execute Adobe token query: ${err.message}`,
        {
          content: err,
          // status: err.response.status
        }
      );
    }
  }
  async getQueryResults(queryConf) {
    if (!this.hasOwnProperty('accessToken')) {
      console.debug('AdobeAPI: getting access token before getQueryResults');
      await this.getToken();
    }
    console.debug('AdobeAPI: starting getQueryResults with queryConf', {
      content: queryConf,
    });
    queryConf.headers = this.getAuthHeaders();
    try {
      let res = await axios(queryConf);
      return res.data;
    } catch (err) {
      console.error(`AdobeAPI Failed Adobe query`, {
        content: err,
        // status: err.response.status,
      });
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': `${this.credentials.clientId}`,
    };
  }
}

export default AdobeUserMgmtApi;
