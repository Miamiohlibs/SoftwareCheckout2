const inquirer = require('inquirer');
// const realAppConf = require('../config/appConf');
const realConf = require('../config/libCal');
const LibCalApi = require('../models/LibCalApi');
const api = new LibCalApi(realConf);
const { genList, compactStringify } = require('../helpers/utils');

/*
    This demo looks up the software categories for the LibCalCid 
    values specified in the appConf.js file. It then prompts the user 
    to select one of the categories. It then gets the bookings for
    that category and gives the option to display the current bookings.
*/

const main = async () => {
  let res = await api.getSoftwareCategories();
  let knownCats = res[0].categories.map((cat) => {
    return `${cat.name} (${cat.cid})`;
  });
  let knownCatDetails = res[0].categories;
  // console.log(`name: ${res[0].name}`);
  // console.log(`categories:`);
  // console.log(knownCats);

  let getCats = await inquirer.prompt(
    genList({
      list: knownCatDetails, // array of objects
      message: 'Which category to get bookings for?',
      itemNameProp: 'name',
      itemValueProp: 'cid',
      outputLabel: 'libCalCategory',
    })
  );
  console.log(
    `Getting bookings for libcal cat id: ${getCats.libCalCategory}...`
  );
  // console.log(`Displaying libCalCategoryId: ${getCats.libCalCategory}`);
  res = await api.getBookings(getCats.libCalCategory);
  console.log(`Received ${res.length} bookings`);
  let showBookings = await inquirer.prompt({
    type: 'rawlist',
    name: 'showBookings',
    message: 'Show bookings?',
    choices: ['Compressed', 'Mini', 'Email only', 'Full', 'None'],
  });
  switch (showBookings.showBookings) {
    case 'Full':
      console.log(JSON.stringify(res, null, 2));
      next();
      break;
    case 'Mini':
      let miniBookings = res.map(({ bookId, email, status }) => ({
        bookId,
        email,
        status,
      }));
      console.log(compactStringify(miniBookings));
      next();
      break;
    case 'Email only':
      let emailBookings = res.map(({ email }) => email);
      console.log(compactStringify(emailBookings));
      next();
      break;
    case 'Compressed':
      let bookings = res.map(
        ({ bookId, fromDate, toDate, firstName, lastName, email, status }) => ({
          bookId,
          fromDate,
          toDate,
          firstName,
          lastName,
          email,
          status,
        })
      );
      console.log(JSON.stringify(bookings));
      next();
      break;
    default:
    // do nothing
  }
};

const next = async () => {
  // inquirer ask if we should do another one or stop
  let another = await inquirer.prompt({
    type: 'confirm',
    name: 'another',
    message: 'Do another?',
    default: false,
  });
  if (another.another) {
    main();
  } else {
    console.log('Goodbye!');
    process.exit();
  }
};

(async () => {
  main();
})();
