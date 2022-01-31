const appConf = require('../config/appConf');
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const emailConverterRepo = require('../repositories/EmailConverterRepository');
const logger = require('./logger');
const convertRepo = new emailConverterRepo(appConf);
const process = require('process');
let pid = process.pid;

/*
- take in an array of emails
    - request authoritative emails from db
    - request any stragglers from emailConverter API
- return array of authoritative emails
- log any remaining stragglers to error log
*/

module.exports = async (emails) => {
  logger.info(`starting emailConverterService (pid:${pid})`);
  await emailRepo.connect();
  logger.info(`emailConverterService connected to db (pid:${pid})`);
  // currently the querySpecificEmails option is getting an error
  // knownEmails = await emailRepo.querySpecificEmails(emails);
  // alternate definition may or may not result in a faster process
  logger.info(`emailConverterService querying db (pid:${pid})`);
  knownEmails = await emailRepo.queryAllEmails();
  logger.info(`emailConverterService query complete (pid:${pid})`, { queryResults: knownEmails.length });
  let { found, missing } = await emailRepo.getKnownAndUnknownEmails(
    emails,
    knownEmails
  );

  let authoritativeEmails = found;

  logger.info(`emailConverterService sorting results (pid:${pid})`, { found: found.length, missing: missing.length });
  let {
    authFound,
    authMissing,
    newMatches,
  } = await convertRepo.getAuthoritativeEmailsBatch(missing);

  logger.info(`emailConverterService finished getAuthoritativeEmailsBatch (pid:${pid})`, { found: found.length, missing: missing.length });

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

  logger.info(`emailConverterService.js finished (pid:${pid}))`;
  return authoritativeEmails.concat(authFound);
};
