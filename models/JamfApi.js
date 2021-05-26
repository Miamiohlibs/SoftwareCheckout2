process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // dangerous -- don't leave this here forever
const { default: axios } = require('axios');
logger = require('../services/logger');

module.exports = class JamfApi {
  constructor(conf) {
    this.auth = conf.auth;
    this.baseUrl = conf.baseUrl + '/JSSResource';
    this.userGroupRoute = this.baseUrl + '/usergroups/id/';
    this.userEmailRoute = this.baseUrl + '/users/email/';
    this.userRoute = this.baseUrl + '/users/id/';
    this.newUserRoute = this.userRoute + '0';
  }

  async submitPut(url, xml = null) {
    // success = res.status == 201
    try {
      let config = {
        auth: this.auth,
        headers: { 'Content-Type': 'text/xml' },
      };
      let res = await axios.put(url, xml, config);
      return res;
    } catch (err) {
      logger.error('Error submitting Jamf PUT query', err);
    }
  }

  async submitGet(url) {
    try {
      let config = { auth: this.auth, headers: { Accept: 'application/json' } };
      let res = await axios.get(url, config);
      return res.data;
    } catch (err) {
      logger.error('Error submitting Jamf GET query', { error: err });
      return false;
    }
  }

  async submitPost(url, xml = null) {
    try {
      let config = {
        auth: this.auth,
        headers: { 'Content-Type': 'text/xml' },
      };
      let res = await axios.post(url, xml, config);
      return res.data;
    } catch (err) {
      logger.error('Error submitting Jamf POST query', { error: err });
    }
  }

  async submitDelete(url) {
    try {
      let config = { auth: this.auth };
      let res = await axios.delete(url, config);
      return res.data;
    } catch (err) {
      logger.error('Error submitting Jamf DELETE query', { error: err });
    }
  }
};
