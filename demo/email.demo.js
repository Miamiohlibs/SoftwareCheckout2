/* test email converter */
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const EmailConverterRepository = require('../repositories/EmailConverterRepository');
const appConf = require('../config/appConf');
const convertRepo = new EmailConverterRepository(appConf);
const emailConverterService = require('../services/emailConverterService');
const database = require('../helpers/database');
const UniqEmail = require('../models/UniqEmail');

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
})();
