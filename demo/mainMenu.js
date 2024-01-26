const inquirer = require('inquirer');
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

module.exports = { mainMenu };
