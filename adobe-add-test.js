const AdobeUserMgmtRepo = require('./repositories/AdobeRepository');
const adobeConf = require('./config/adobe');
const adobe = new AdobeUserMgmtRepo(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./classes/LicenseGroup');
const lg = new LicenseGroup(appConf);

let group = 'Library API test';

(async () => {
  try {
    let res = await adobe.addGroupMembers(
      [
        'qum@miamioh.edu',
        'yarnete@miamioh.edu',
        // 'irwinkr@miamioh.edu',
        // 'hawkpf@miamioh.edu',
        // 'diebelsa@miamioh.edu',
        // 'brownsj1@miamioh.edu',
        // 'bomholmm@miamioh.edu',
        // 'kaiserj5@miamioh.edu',
        // 'calabrcm@miamioh.edu',
        // 'conleyj@miamioh.edu',
        // 'wegnera3@miamioh.edu',
      ],
      group,
      'test'
    );
    console.log(res);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
