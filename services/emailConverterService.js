const appConf = require('../config/appConf');
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const emailConverterRepo = require('../repositories/EmailConverterRepository');
const logger = require('./logger');
const convertRepo = new emailConverterRepo(appConf);
const process = require('process');
let pid = process.pid;

/*
The purpose of this service to get the authoritative email address for a given email address. 
The given address may be an alias. Authoritative email addresses are stored in the database,
and can be retrieved from the emailConverter API. We request them from the API once and store
them in the database for future use.

- take in an array of emails
    - request authoritative emails from db
    - for any previously unknown emails, request authoritative email from emailConverter API
- return array of authoritative emails
- log any remaining stragglers to error log
- if there are any new emails, add them to the db
- if this process fails, return the original emails [most will still be valid, so better this than nothing]
*/

module.exports = async (emails) => {
  try {
    logger.info(`starting emailConverterService (pid:${pid})`);
    await emailRepo.connect();
    logger.info(`emailConverterService connected to db (pid:${pid})`);
    // currently the querySpecificEmails option is getting an error
    // knownEmails = await emailRepo.querySpecificEmails(emails);
    // alternate definition may or may not result in a faster process
    logger.info(`emailConverterService querying db (pid:${pid})`);
    knownEmails = await emailRepo.queryAllEmails();
    logger.info(`emailConverterService query complete (pid:${pid})`, {
      queryResults: knownEmails.length,
    });
    // let knownEmails = []; //comment this out when you uncomment the above

    let { found, missing } = await emailRepo.getKnownAndUnknownEmails(
      emails,
      knownEmails
    );

    let authoritativeEmails = found;

    logger.info(`emailConverterService sorting results (pid:${pid})`, {
      found: found.length,
      missing: missing.length,
    });

    // authFound = array of emails we found matches for in the converter API
    // authMissing = array of emails with no match
    // newMatches = array of pairs: email & uniqEmail (these are the same emails as authFound, but with more info to pass to the db)
    let { authFound, authMissing, newMatches } =
      await convertRepo.getAuthoritativeEmailsBatch(missing);

    logger.info(
      `emailConverterService finished getAuthoritativeEmailsBatch (pid:${pid})`,
      { found: found.length, missing: missing.length }
    );

    if (newMatches.length > 0) {
      logger.info(
        'emailConverterService: adding new emails pairs with',
        newMatches
      );
      await emailRepo.addNewEmailPairs(newMatches);
    }
    if (authMissing.length > 0) {
      logger.error(
        'emailConverterService: Failed to get authoritative emails for:',
        {
          missing: authMissing,
        }
      );
    }

    await emailRepo.disconnect();

    logger.info(`emailConverterService.js finished (pid:${pid})`);
    // return the list of authoritativeEmails from the datbase
    // plus the list of authFound from the API
    return authoritativeEmails.concat(authFound);
  } catch (err) {
    logger.error(
      'emailConverterService.js failed; returning original emails instead of converted ones:',
      err
    );
    return emails;
  }
};
