/* test email converter */
const UniqEmailRepo = require('../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepo();
const EmailConverterRepository = require('../repositories/EmailConverterRepository');
const appConf = require('../config/appConf');
const emailConverterService = require('../services/emailConverterService');
const inquirer = require('inquirer');

// list all emails
// getUniqForEmail
// insert email pair
// delete email pair
// ADD to Repo/API: get all email pairs for uniqEmail?

const mainMenu = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'mainMenu',
      message: 'What would you like to do?',
      choices: [
        {
          name: 'Get unique email for user',
          value: 'getUniqForOneEmail',
        },
        {
          name: 'Get all emails',
          value: 'getAllEmails',
        },
        {
          name: 'Add an alias/unique Email pair',
          value: 'addEmailPair',
        },
        {
          name: 'Delete an alias/unique Email pair',
          value: 'deleteEmailPair',
        },
        {
          name: 'Quit',
          value: 'quit',
        },
      ],
    },
  ]);
};

const getOneEmail = async () => {
  const entry = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Email address?',
  });
  let res = await emailConverterService([entry.email]);
  console.log(res);
};

const getAllEmails = async () => {
  await emailRepo.connect();
  const emails = await emailRepo.queryAllEmails();
  await emailRepo.disconnect();
  console.log(emails);
};

const addEmailPair = async () => {
  const alias = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Alias address?',
  });
  const uniq = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Unique address?',
  });
  const confirm = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Add ${alias.email} as an alias for ${uniq.email}?`,
  });
  if (confirm.confirm) {
    await emailRepo.connect();
    try {
      let res = await emailRepo.addNewEmailPairs([
        {
          email: alias.email,
          uniqEmail: uniq.email,
        },
      ]);
      if (res === undefined) {
        console.log('Error adding email pair');
      } else {
        console.log('Email pair added');
      }
    } catch (err) {
      console.log('Error adding email pair:', err);
    }
    emailRepo.disconnect();
  } else {
    console.log('Nevermind then!');
  }
};

const deleteEmailPair = async () => {
  const deletable = await inquirer.prompt({
    type: 'input',
    name: 'email',
    message: 'Alias email address to delete?',
  });
  const confirm = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Really delete entry where alias is ${deletable.email}?`,
  });
  if (confirm.confirm) {
    await emailRepo.connect();
    try {
      let res = await emailRepo.deleteEmailByAlias(deletable.email);
      if (res === undefined) {
        console.log('Error deleting email pair');
      } else {
        console.log('Email pair deleted');
      }
    } catch (err) {
      console.log('Error deleting email pair:', err);
    }
    await emailRepo.disconnect();
  }
};

const main = async () => {
  const action = await mainMenu();
  switch (action.mainMenu) {
    case 'getUniqForOneEmail':
      await getOneEmail();
      main();
      break;
    case 'getAllEmails':
      await getAllEmails();
      await main();
      break;
    case 'addEmailPair':
      await addEmailPair();
      main();
      break;
    case 'deleteEmailPair':
      await deleteEmailPair();
      main();
      break;
    case 'quit':
      break;
  }
};

// Begin executing code:

console.log(
  'This interface connects to the database that tracks unique email addresses and their aliases. To run, you may have to open an SSH tunnel to the database first. If you cannot connect to the database, a missing SSH tunnel may be the issue.'
);
main();
