const { default: axios } = require('axios');
logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');

module.exports = class JamfApi {
  constructor(conf) {
    this.auth = conf.auth;
    this.authUrl = conf.baseUrl + '/api/v1/auth/token';
    this.baseUrl = conf.baseUrl + '/JSSResource';
    this.userGroupsRoute = this.baseUrl + '/usergroups';
    this.userGroupRoute = this.baseUrl + '/usergroups/id/';
    this.userEmailRoute = this.baseUrl + '/users/email/';
    this.userRoute = this.baseUrl + '/users/id/';
    this.newUserRoute = this.userRoute + '0';
    if (conf.danger_tls_reject_unauthorized === true) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // dangerous -- don't leave this here forever
    }
  }

  async getToken() {
    try {
      const res = await axios.post(this.authUrl, {}, { auth: this.auth });
      this.token = res.data.token;
    } catch (err) {
      console.log('JamfAPI: Error submitting get token', axiosLogPrep(err));
    }
  }

  async submitPut(url, xml = null) {
    // success = res.status == 201
    if (!this.token) {
      await this.getToken();
    }
    logger.debug('JamfAPI: beginning submitPut with url and with xml', {
      content: { url, xml },
    });
    try {
      let config = {
        // auth: this.auth,
        headers: {
          'Content-Type': 'text/xml',
          Authorization: `Bearer ${this.token}`,
        },
      };
      let res = await axios.put(url, xml, config);
      return res;
    } catch (err) {
      logger.error('JamfAPI: Error submitting Jamf PUT query', {
        content: axiosLogPrep(err),
        status: err.response.status,
      });
    }
  }

  async submitGet(url) {
    if (!this.token) {
      await this.getToken();
    }
    try {
      let config = {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      };
      let res = await axios.get(url, config);
      return res.data;
    } catch (err) {
      logger.error('JamfAPI: Error submitting Jamf GET query', {
        content: axiosLogPrep(err),
        status: err.response.status,
      });
      return false;
    }
  }

  async submitPost(url, xml = null) {
    if (!this.token) {
      await this.getToken();
    }
    try {
      let config = {
        // auth: this.auth,
        headers: {
          'Content-Type': 'text/xml',
          Authorization: `Bearer ${this.token}`,
        },
      };
      let res = await axios.post(url, xml, config);
      return res.data;
    } catch (err) {
      logger.error('JamfAPI: Error submitting Jamf POST query', {
        content: axiosLogPrep(err),
        status: err.response.status,
      });
    }
  }

  async submitDelete(url) {
    if (!this.token) {
      await this.getToken();
    }
    try {
      let config = { headers: { Authorization: `Bearer ${this.token}` } };
      let res = await axios.delete(url, config);
      return res.data;
    } catch (err) {
      logger.error('JamfAPI: Error submitting Jamf DELETE query', {
        content: axiosLogPrep(err),
        status: err.response.status,
      });
    }
  }
};
