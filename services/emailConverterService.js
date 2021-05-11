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
  // currently the querySpecificEmails option is getting an error
  // knownEmails = await emailRepo.querySpecificEmails(emails);
  // alternate definition may or may not result in a faster process
  knownEmails = await emailRepo.queryAllEmails();
  let { found, missing } = await emailRepo.getKnownAndUnknownEmails(
    emails,
    knownEmails
  );

  let authoritativeEmails = found;

  let {
    authFound,
    authMissing,
    newMatches,
  } = await convertRepo.getAuthoritativeEmailsBatch(missing);

  if (newMatches.length > 0) {
    logger.info('adding new emails pairs with', newMatches);
    await emailRepo.addNewEmailPairs(newMatches);
  }
  if (authMissing.length > 0) {
    logger.error('Failed to get authoritative emails for:', {
      missing: authMissing,
    });
  }

  await emailRepo.disconnect();

  return authoritativeEmails.concat(authFound);
};
