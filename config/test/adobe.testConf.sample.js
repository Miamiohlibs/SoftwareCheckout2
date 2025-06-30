/* 
  Copy this file to config/test/adobe.testConf.js and replace the sample data
  with your own real data.

  This file is used as sample data for running the ./test/models/AdobeApi-async.test.js 
  test suite. To use it, copy it to config/test/adobe.testConf.js and
  replace the sample data with your own real data. In the testGroup object,
  replace the vendorGroupName and vendorGroupId with your own Adobe group name
  and group ID. In the arrays of emails, replace the sample emails with real, valid,
  current emails from your institution. Note: you may find in the future that
  you need to update the lists of emails to match current members of your institution
  as people change jobs, etc.
*/

module.exports = {
  testGroup: {
    vendor: 'Adobe',
    vendorGroupName: 'Library API/test', // replace with your Adobe test group name
    vendorGroupId: '123456789', // replace with your Adobe test group ID
    active: true,
  },
  // one real user email
  emailsToAdd1: ['realuser@yourinstitution.edu'],

  // two real user emails
  emailsToAdd2: [
    'realuser@yourinstitution.edu',
    'realuser2@yourinstitution.edu',
  ],

  // one fake user email
  emailsFake1: ['thisissuchafakeemail@yourinstitution.edu'],

  // 11 real users emails
  emailsBigList: [
    'realuser@yourinstitution.edu',
    'realuser2@yourinstitution.edu',
    'realuser3@yourinstitution.edu',
    'realuser4@yourinstitution.edu',
    'realuser5@yourinstitution.edu',
    'realuser6@yourinstitution.edu',
    'realuser7@yourinstitution.edu',
    'realuser8@yourinstitution.edu',
    'realuser9@yourinstitution.edu',
    'realuser10@yourinstitution.edu',
    'realuser11@yourinstitution.edu',
  ],
};
