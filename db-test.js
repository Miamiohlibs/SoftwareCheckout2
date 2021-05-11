const mongoose = require('mongoose');
const appConf = require('./config/appConf');
const UniqEmailRepo = require('./repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();

/*
 UniqEmailRepo offers two ways to get the same info:
 1. queryAllEmails fetches all the emails from the db and then looks for the desired content
 2. querySpecificEmails builds a potentially long query for just the desired entries

 which will be faster and more efficient when running at scale? I don't know
*/

(async () => {
  await emailRepo.connect();
  lookfor = ['jerry.yarn@miamioh.edu', 'ken.irwin@miamioh.edu'];
  // emails = await emailRepo.queryAllEmails();
  emails = await emailRepo.querySpecificEmails(lookfor);
  console.log(emailRepo.getKnownAndUnknownEmails(lookfor, emails));
  await emailRepo.disconnect();
})();
