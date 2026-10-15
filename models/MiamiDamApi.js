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
      logger.debug(
        `API getQueryResults status: ${res.status}, data: ${JSON.stringify(res.data)}`,
      );
      return res;
    } catch (err) {
      // err.response is undefined for network-level failures (DNS, TLS, timeout)
      const status = err.response?.status;
      logger.error(
        `MiamiDamApi Failed query: ${err.code || ''} ${err.message}`,
        {
          content: axiosLogPrep(err),
          status: status,
        },
      );
      return { success: false, status: status };
    }
  }
};
