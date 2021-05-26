const { result } = require('lodash');
const jamfConf = require('./config/jamf');
const JamfApi = require('./models/JamfApi');
const jamf = new JamfApi(jamfConf);
const JamfRepository = require('./repositories/JamfRepository');
const jamfRepo = new JamfRepository(jamfConf);

(async () => {
  console.log('starting jamf test service');
  try {
    // let res = await jamf.submitGet(
    //   'https://muawjssp01.it.muohio.edu:8443/JSSResource/usergroups/id/3'
    // );
    let res = await jamfRepo.getGroupMembers(3);
    console.log(result);
  } catch (err) {
    console.log('error:', err);
  }
})();
