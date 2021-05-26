const UniqEmailRepo = require('./repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const EmailConverterRepository = require('./repositories/EmailConverterRepository');
const appConf = require('./config/appConf');
const convertRepo = new EmailConverterRepository(appConf);
const emailConverterService = require('./services/emailConverterService');
const database = require('./helpers/database');
const UniqEmail = require('./models/UniqEmail');
/*
 UniqEmailRepo offers two ways to get the same info:
 1. queryAllEmails fetches all the emails from the db and then looks for the desired content
 2. querySpecificEmails builds a potentially long query for just the desired entries

 which will be faster and more efficient when running at scale? I don't know
*/

(async () => {
  /* Test connection */
  await database.connect();
  // let res = await UniqEmail.find();
  let res = await emailRepo.queryAllEmails();
  console.log(res);
  await database.disconnect();

  // await emailRepo.connect();
  // lookfor = ['jerry.yarnetsky@miamioh.edu', 'ken.irwin@miamioh.edu'];
  // // emails = await emailRepo.queryAllEmails();
  // emails = await emailRepo.querySpecificEmails(lookfor);
  // console.log(emailRepo.getKnownAndUnknownEmails(lookfor, emails));
  // await emailRepo.disconnect();

  /* Higher order business */
  // lookfor = [
  //   'qum@miamioh.edu',
  //   'diebelsa@miamioh.edu',
  //   'brownsj1@miamioh.edu',
  //   'bomholmm@miamioh.edu',
  //   'jerry.yarnetsky@miamioh.edu',
  //   'ken.irwin@miamioh.edu',
  //   'kirwin@wittenberg.edu',
  //   'ken@kenirwin.net',
  // ];
  // let res = await emailConverterService(lookfor);
  // console.log(res);
})();
