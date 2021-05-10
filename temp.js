const Utils = require('./helpers/Utils');
const utils = new Utils();
const EmailApi = require('./models/EmailConvertererApi');
const appConf = require('./config/appConf');
const api = new EmailApi(appConf);
const _ = require('lodash');
const jamfConf = require('./config/jamf');
const axios = require('axios');

// console.log(api);

(async () => {
  try {
    let url = jamfConf.baseUrl + 'JSSResource/usergroups';
    let res = await axios.request({
      method: 'get',
      url: url,
      auth: jamfConf.auth,
    });
    console.log(res.data);
  } catch (err) {
    console.log(err);
  }
})();

// let knownUsers = [
//   {
//     email: 'irwinkr@miamioh.edu',
//     uniqId: 'irwinkr@miamioh.edu',
//   },
// ];

// let emails = ['irwinkr@miamioh.edu', 'jerry.yarnetsky@miamioh.edu'];

// let knownEmails = knownUsers.map((i) => i.email);
// let missing = utils.filterToEntriesMissingFromSecondArray(emails, knownEmails);
// console.log(missing);

// (async () => {
//   let email = 'jerry.yarnetsky@miamioh.edu';
//   let uniq = await api.getAuthoritativeEmail(email);
//   console.log(uniq);
// })();
