const jamfConf = require('./config/jamf');
// const JamfApi = require('./models/JamfApi');
// const jamf = new JamfApi(jamfConf);
const JamfRepository = require('./repositories/JamfRepository');
const jamfRepo = new JamfRepository(jamfConf);

module.exports = async () => {
  console.log('starting jamf test service');
  let res = await jamfRepo.getGroupMembers(3);
  console.log(res);
};
