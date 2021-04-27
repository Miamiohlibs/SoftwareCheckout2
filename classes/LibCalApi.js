const Debug = require('debug');
const debug = new Debug('AdobeApi');
const axios = require('axios');

module.exports = class LibCalApi {
  constructor(conf) {
    this.conf = conf;
    this.baseUrl = conf.credentials.auth.tokenHost + '/1.1/equipment/';
    const required = ['credentials', 'queryConfig'];
    required.forEach((element) => {
      if (!this.conf.hasOwnProperty(element)) {
        throw new Error('LibCalApi missing required property: ' + element);
      }
    });
  }

  async getToken() {
    const oauth2 = require('simple-oauth2').create(this.conf.credentials);
    try {
      const result = await oauth2.clientCredentials.getToken();
      this.accessToken = result.access_token;
      debug('LibCal Token: ' + this.accessToken);
      return true;
    } catch (err) {
      console.error('LibCalAccess Token Error:', err.message);
    }
  }

  async getSoftwareCategories() {
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl + 'categories/' + this.conf.softwareLocation;
    this.queryConf.method = 'get';
    return await this.getQueryResults();
  }

  clearQueryConf() {
    this.queryConf = {};
  }

  async getQueryResults() {
    if (!this.hasOwnProperty('accessToken')) {
      debug('getting access token before getQueryResults');
      await this.getToken();
      this.queryConf.headers = this.getAuthHeaders();
      try {
        let res = await axios(this.queryConf);
        return res.data;
      } catch (err) {
        console.log(('Failed LibCal query:', err));
      }
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
  // getEquipmentCategories
  //https://muohio.libcal.com/1.1/equipment/categories/8370

  // async getOneLibCalList(element, params = '') {
  //   const libCalOptions = this.conf;

  //   // only get location: library software
  //   if (element == 'categories') {
  //     var id = '/' + this.conf.softwareLocation;
  //   } else {
  //     id = '';
  //   }

  //   this.conf.queryConfig.options.path = '/1.1/equipment/' + element + id;
  //   this.conf.queryConfig.options.headers = {
  //     Authorization: 'Bearer ' + this.token,
  //   };
  //   if (element == 'bookings') {
  //     this.conf.queryConfig.options.path +=
  //       '?limit=100&lid=' + this.conf.softwareLocation + params;
  //   }
  //   console.debug(this.conf.queryConfig.options.path, this.token);
  //   // get a promise for each call
  //   try {
  //     let query = new Query(this.conf.queryConfig);
  //     let response = await query.execute();
  //     return response;
  //   } catch {
  //     console.error('failed to get libcal query');
  //   }
  // }
};
