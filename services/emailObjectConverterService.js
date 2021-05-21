/*
    Use this instead of emailConverterService when you need not just to get a users' authoritative emails, but when you need those authEmails to be added to an existing user object with the rest of the object intact.

    This is useful when multiple properties of the user object will be used to create a new user on a service's platform. 

    For example: Jamf user creation should have several user properties: name, uid, email -- we need that data to all stay together, so we use this service. 
*/

const appConf = require('../config/appConf');
const EmailConverterRepo = require('../repositories/EmailConverterRepository');
const emailRepo = new EmailConverterRepo(appConf);
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const uniqRepo = new UniqEmailRepo();

module.exports = async (objects) => {
  // first look for emails in our database of known emails
  await uniqRepo.connect();
  knownEmails = await uniqRepo.queryAllEmails();
  console.log('known emails:', knownEmails);
  console.log('objects to match:', objects);
  let { found, missing } = uniqRepo.updateObjectsWithKnownEmails(
    objects,
    'email',
    knownEmails
  );

  let authoritativeEmails = found;

  // then look up any as-yet-unknowns in the designated API
  let { authFound, authMissing, newMatches } =
    await emailRepo.updateObjectsWithAuthEmails(missing, 'email');

  // add any new matches to the uniqRepo database
  if (newMatches.length > 0) {
    logger.info('adding new emails pairs with', newMatches);
    await uniqRepo.addNewEmailPairs(newMatches);
  }

  // log any errors
  if (authMissing.length > 0) {
    logger.error('Failed to get authoritative emails for:', {
      missing: authMissing,
    });
  }

  await uniqRepo.disconnect();

  return authoritativeEmails.concat(authFound);
};
