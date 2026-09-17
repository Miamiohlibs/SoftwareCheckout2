const axios = require('axios');
const path = require('path');
const fs = require('fs');
const logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.token = conf.credentials.token;
    this.baseUrl = conf.baseUrl;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getQueryResults(queryConf) {
    logger.debug('MiamiDamApi: starting getQueryResults with queryConf', {
      content: queryConf,
    });
    queryConf.headers = this.getAuthHeaders();
    try {
      let res = await axios.request(queryConf);
      return { data: res.data };
    } catch (err) {
      logger.error(`MiamiDamApi Failed query`, {
        content: axiosLogPrep(err),
        status: err.response.status,
      });
    }
  }
};
