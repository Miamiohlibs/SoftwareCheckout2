const inquirer = require('inquirer');
const config = require('../config/appConf');
const jamfConf = require('../config/jamf');
const { genList } = require('../helpers/utils');
const software = config.software;
const JamfRepository = require('../repositories/JamfRepository');
const jamfRepo = new JamfRepository(jamfConf);
const { mainMenu } = require('./mainMenu');
const jamf = require('../config/jamf');
const { getErrorMessage } = require('../helpers/httpResponses');
const { get } = require('lodash');

const jamfSoftware = software
  .filter((item) => item.vendor == 'Jamf')
  .map(({ vendorGroupName, vendorGroupId, active }) => ({
    vendorGroupName,
    vendorGroupId,
    active,
  }));

const chooseGroup = async (verb) => {
  return await inquirer.prompt(
    genList({
      list: jamfSoftware,
      message: `${verb} users in which group?`,
      itemNameProp: 'vendorGroupName',
      itemValueProp: 'vendorGroupId',
      outputLabel: 'groupId',
    })
  );
};

const listGroups = async () => {
  console.log('Jamf Groups in config file:');
  console.log(jamfSoftware);
  console.log('Jamf Groups in Jamf:');
  const jamfGroups = await jamfRepo.getGroups();
  console.log(jamfGroups);
};

const listUsers = async () => {
  const getSoftware = await chooseGroup('List');
  const groupId = getSoftware.groupId;
  console.log('groupId: ' + groupId);
  const users = await jamfRepo.getGroupMembers(groupId);
  console.log(JSON.stringify(users, null, 2));
};
const findUser = async () => {
  const getSoftware = await chooseGroup('Find');
  const groupId = getSoftware.groupId;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  const users = await jamfRepo.getGroupMembers(groupId);
  let res = users.filter((item) => item == entry.email);
  console.log(JSON.stringify(res, null, 2));
};

const addUsers = async () => {
  const getSoftware = await chooseGroup('Add');
  const groupId = getSoftware.groupId;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  await handleUpdate('add', groupId, entry);
};

const removeUsers = async () => {
  const getSoftware = await chooseGroup('Remove');
  const groupId = getSoftware.groupId;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  await handleUpdate('delete', groupId, entry);
};

const handleUpdate = async (verb, groupId, entry) => {
  let method = 'addUsersToGroup';
  if (verb == 'delete') {
    method = 'deleteUsersFromGroup';
  }
  let res = await jamfRepo[method](groupId, [entry.email]);
  if (res === undefined) {
    console.log('Update Failed: see error log for details.');
    return;
  } else {
    console.log(getErrorMessage(res.status));
  }
};

const main = async () => {
  const action = await mainMenu();
  switch (action.mainMenu) {
    case 'addUsers':
      await addUsers();
      main();
      break;
    case 'removeUsers':
      await removeUsers();
      main();
      break;
    case 'listUsers':
      await listUsers();
      main();
      break;
    case 'findUser':
      await findUser();
      main();
      break;
    case 'listGroups':
      await listGroups();
      main();
      break;
    case 'quit':
      process.exit();
  }
};

main();
