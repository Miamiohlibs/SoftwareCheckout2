const EmailApi = require('./models/EmailConvertererApi');
const appConf = require('./config/appConf');
const api = new EmailApi(appConf);
const _ = require('lodash');
const jamfConf = require('./config/jamf');
const axios = require('axios');
const JamfApi = require('./models/JamfApi');
const jamf = new JamfApi(jamfConf);
const xmlMinify = require('minify-xml').minify;
const JamfRepo = require('./repositories/JamfRepository');
const repo = new JamfRepo(jamfConf);

// require('https').globalAgent.options.ca = require('ssl-root-cas').create();
// console.log(api);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// let res = jamf.addUsersToGroup(3, ['userOne', 'userTwo']);
// console.log(res);

(async () => {
  // url = 'https://muawjssp01.it.muohio.edu:8443/JSSResource/usergroups/id/3';
  // let res = await repo.getGroupMembers(3);
  let res = await repo.deleteUserById(2289);
  console.log(res);
  // let res = await jamf.addUsersToGroup(3, ['irwinkr', 'bomholmm']);
  // console.log(res.status, res.data);
  // try {
  //   // let url = jamfConf.baseUrl + 'JSSResource/usergroups/id/3';
  //   let url =
  //     'https://muawjssp01.it.muohio.edu:8443/JSSResource/usergroups/id/3';
  //   let xml =
  //     '<user_group><user_additions><user><username>irwinkr</username></user></user_additions></user_group>';
  //   let reqConf = {
  //     headers: { 'Content-Type': 'text/xml' },
  //     auth: jamfConf.auth,
  //   };
  //   console.log(reqConf);
  //   let res = await axios.put(url, xml, reqConf);
  //   console.log(res.data);
  // } catch (err) {
  //   console.log(err.response.data);
  //   console.log(err.response.status);
  // }
})();
