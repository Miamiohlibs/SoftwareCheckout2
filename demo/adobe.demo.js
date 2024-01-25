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

const listUsers = async () => {
  const getSoftware = await inquirer.prompt(
    genList({
      list: adobeSoftware,
      message: 'Get users for which group?',
      itemNameProp: 'vendorGroupName',
      itemValueProp: 'vendorGroupName',
      outputLabel: 'groupName',
    })
  );
  const groupName = getSoftware.groupName;
  console.log('groupName: ', groupName);
  const users = (await adobeRepo.getGroupMembers(groupName)).map(
    ({ email, firstname, lastname }) => ({ email, firstname, lastname })
  );
  console.log(JSON.stringify(users, null, 2));
};
const main = async () => {
  const action = await mainMenu();
  switch (action.mainMenu) {
    case 'addUsers':
      break;
    case 'removeUsers':
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
