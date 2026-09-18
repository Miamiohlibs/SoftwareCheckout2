// select which adobe permissions group to interact with

// select an action: add, remove, list, quit
// if add, prompt for uniqueId address
// if remove, prompt for uniqueId address
// if list, list all users in the group
// if quit, exit the program
const inquirer = require('inquirer');
const config = require('../config/appConf');
const miamiConf = require('../config/miamiDam');
const { genList } = require('../helpers/utils');
const software = config.software;
const MiamiRepository = require('../repositories/MiamiDamRepository');
const vendorRepo = new MiamiRepository(miamiConf);
const { mainMenu } = require('./mainMenu');

const vendorSoftware = software
  .filter((item) => item.vendor == 'MiamiDam')
  .map(({ vendorGroupName, vendorGroupId, active }) => ({
    vendorGroupName,
    vendorGroupId,
    active,
  }));

const listGroups = () => {
  console.log(vendorSoftware);
};

const chooseGroup = async (verb) => {
  return await inquirer.prompt(
    genList({
      list: vendorSoftware,
      message: `${verb} users in which group?`,
      itemNameProp: 'vendorGroupName', // display this
      itemValueProp: 'vendorGroupId', // return this
      outputLabel: 'groupName',
    }),
  );
};

const addUser = async () => {
  const getSoftware = await chooseGroup('Add');
  const groupName = getSoftware.groupName;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'uniqueId',
    message: 'uniqueId?',
  });
  let res = await vendorRepo.addGroupMember(entry.uniqueId, groupName);
  console.log(JSON.stringify(res));
};

const removeUsers = async () => {
  const getSoftware = await chooseGroup('Remove');
  const groupName = getSoftware.groupName;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'uniqueId',
    message: 'uniqueId?',
  });
  let res = await vendorRepo.removeGroupMember(entry.uniqueId, groupName);
  console.log(JSON.stringify(res, null, 2));
};

const listUsers = async () => {
  const getSoftware = await chooseGroup('List');
  const groupName = getSoftware.groupName;
  const users = await vendorRepo.getGroupMembers(groupName);
  console.log(JSON.stringify(users, null, 2));
};

const findUser = async () => {
  const getSoftware = await chooseGroup('Find');
  const groupName = getSoftware.groupName;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'uniqueId',
    message: 'uniqueId?',
  });
  let res = await vendorRepo.getOneGroupMember(entry.uniqueId, groupName);
  console.log(JSON.stringify(res, null, 2));
};

const main = async () => {
  const action = await mainMenu();
  switch (action.mainMenu) {
    case 'addUsers':
      await addUser();
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
      listGroups();
      main();
      break;
    case 'quit':
      console.log('Goodbye!');
      break;
  }
};

main();
