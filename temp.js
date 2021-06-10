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
const LibCalApi = require('./models/LibCalApi');
const libCalConf = require('./config/libCal');
const lcapi = new LibCalApi(libCalConf);
const LibCalRepo = require('./repositories/LibCalRepository');
const libCal = new LibCalRepo(libCalConf);

// require('https').globalAgent.options.ca = require('ssl-root-cas').create();
// console.log(api);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// let res = jamf.addUsersToGroup(3, ['userOne', 'userTwo']);
// console.log(res);

(async () => {
  let cid = '21968';
  // let libCalBookings = await libCal.getCurrentValidBookings(cid);
  let res = await lcapi.getBookings(cid);
  console.log(res);
})();
