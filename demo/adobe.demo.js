// select which adobe permissions group to interact with

// select an action: add, remove, list, quit
// if add, prompt for email address
// if remove, prompt for email address
// if list, list all users in the group
// if quit, exit the program
const inquirer = require('inquirer');
const config = require('../config/appConf');
const adobeConf = require('../config/adobe');
const { genList } = require('../helpers/utils');
const software = config.software;
const AdobeRepository = require('../repositories/AdobeRepository');
const adobeRepo = new AdobeRepository(adobeConf);

const adobeSoftware = software
  .filter((item) => item.vendor == 'Adobe')
  .map(({ vendorGroupName, active }) => ({
    vendorGroupName,
    active,
  }));

const mainMenu = () => {
  console.log();
  return inquirer.prompt([
    {
      type: 'list',
      name: 'mainMenu',
      message: 'What would you like to do?',
      choices: [
        {
          name: 'Add users to a group',
          value: 'addUsers',
        },
        {
          name: 'Remove users from a group',
          value: 'removeUsers',
        },
        {
          name: 'List users in a group',
          value: 'listUsers',
        },
        {
          name: 'List groups',
          value: 'listGroups',
        },
        {
          name: 'Quit',
          value: 'quit',
        },
      ],
    },
  ]);
};

const listGroups = () => {
  console.log(adobeSoftware);
};

const chooseGroup = async (verb) => {
  return await inquirer.prompt(
    genList({
      list: adobeSoftware,
      message: `${verb} users in which group?`,
      itemNameProp: 'vendorGroupName',
      itemValueProp: 'vendorGroupName',
      outputLabel: 'groupName',
    })
  );
};

const addUser = async () => {
  const getSoftware = await chooseGroup('Add');
  const groupName = getSoftware.groupName;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  let res = await adobeRepo.addGroupMembers([entry.email], groupName);
  console.log(JSON.stringify(res));
};

const removeUsers = async () => {
  const getSoftware = await chooseGroup('Remove');
  const groupName = getSoftware.groupName;
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  let res = await adobeRepo.removeGroupMembers([entry.email], groupName);
  console.log(JSON.stringify(res, null, 2));
};
const listUsers = async () => {
  const getSoftware = await chooseGroup('List');
  const groupName = getSoftware.groupName;
  const users = (await adobeRepo.getGroupMembers(groupName)).map(
    ({ email, firstname, lastname }) => ({ email, firstname, lastname })
  );
  console.log(JSON.stringify(users, null, 2));
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
