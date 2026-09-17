const axios = require('axios');
const path = require('path');
const fs = require('fs');
const logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.token = conf.credentials.token;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
};
