const appConf = require('../config/appConf');
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const emailConverterRepo = require('../repositories/EmailConverterRepository');
const logger = require('./logger');
const convertRepo = new emailConverterRepo(appConf);

/*
- take in an array of emails
    - request authoritative emails from db
    - request any stragglers from emailConverter API
- return array of authoritative emails
- log any remaining stragglers to error log
*/

module.exports = async (emails) => {
  await emailRepo.connect();
  knownEmails = await emailRepo.querySpecificEmails(emails);
  let { found, missing } = await emailRepo.getKnownAndUnknownEmails(
    emails,
    knownEmails
  );
  let authoritativeEmails = found;
  let {
    authFound,
    authMissing,
  } = await convertRepo.getAuthoritativeEmailsBatch(missing);
  await emailRepo.disconnect();
  logger.error('Failed to get authoritative emails for:', authMissing);
  return authoritativeEmails.concat(authFound);
};
