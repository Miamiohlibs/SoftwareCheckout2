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

const listGroups = () => {
  console.log(jamfSoftware);
};

const listUsers = async () => {
  const getSoftware = await chooseGroup('List');
  const groupId = getSoftware.groupId;
  console.log('groupId: ' + groupId);
  const users = await jamfRepo.getGroupMembers(groupId);
  console.log(JSON.stringify(users, null, 2));
};

const addUsers = async () => {
  const getSoftware = await chooseGroup('Add');
  const groupId = getSoftware.groupId;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  let res = await jamfRepo.addUsersToGroup(groupId, [entry.email]);
  console.log(getErrorMessage(res.status));
};

const removeUsers = async () => {
  const getSoftware = await chooseGroup('Remove');
  const groupId = getSoftware.groupId;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  let res = await jamfRepo.deleteUsersFromGroup(groupId, [entry.email]);
  console.log(getErrorMessage(res.status));
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
    case 'listGroups':
      await listGroups();
      main();
      break;
    case 'quit':
      process.exit();
  }
};

main();
