// const { asyncForEach } = require('../helpers/utils');

const appConf = require('../config/appConf');
const EmailConverterRepo = require('../repositories/EmailConverterRepository');
const emailRepo = new EmailConverterRepo(appConf);
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const uniqRepo = new UniqEmailRepo();

/*
takes in an array of objects and the name of field containing emails
 - (objects, key):
 - e.g. ([{ name: 'James T. Kirk', email: 'capn.kirk@enterprise.net' }], 'email')

foreach item in array of objects
 - lookup authemail from db
 - return { found: objectsWithKnownEmails, missing: objectsWithUnknownEmails }
*/

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

  console.log('found in db:', authoritativeEmails);
  console.log('missing from db:', missing);

  //   // then look up any as-yet-unknowns in the designated API
  let { authFound, authMissing, newMatches } =
    await emailRepo.updateObjectsWithAuthEmails(missing, 'email');

  if (newMatches.length > 0) {
    logger.info('adding new emails pairs with', newMatches);
    await uniqRepo.addNewEmailPairs(newMatches);
  }
  if (authMissing.length > 0) {
    logger.error('Failed to get authoritative emails for:', {
      missing: authMissing,
    });
  }

  console.log('found in API:', authFound);
  await uniqRepo.disconnect();

  return authoritativeEmails.concat(authFound);
};
/*
foreach objectsWithUnknownEmails
 - lookup email, subinto object, list object as found
 - or: log failure

return {
    objectsNowHavingEmails
    unknowns
}
*/
