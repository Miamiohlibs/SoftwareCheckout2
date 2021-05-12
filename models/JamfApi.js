process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { default: axios } = require('axios');

module.exports = class JamfApi {
  constructor(conf) {
    this.auth = conf.auth;
    this.baseUrl = conf.baseUrl + '/JSSResource';
    this.updateGroupRoute = this.baseUrl + '/usergroups/id/';
  }

  async submitPut(url, xml = null) {
    // success = res.status == 201
    try {
      let config = { auth: this.auth, headers: { 'Content-Type': 'text/xml' } };
      let res = await axios.put(url, xml, config);
      return res;
    } catch (err) {
      logger.error('Error submitting Jamf query', err);
    }
  }
};
