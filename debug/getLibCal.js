/*
This does two things: 
1. fetches the current LibCal checkouts
2. displays checkouts that start after the time defined in the first const below

Why do this? While the Adobe API wasn't working for us, we needed a way to know what to update manually. This gave us a quick way of checking for recent updates.

Note: it doesn't tell us who to remove, just who to add. 
*/
const displaySinceDate = '2021-03-11 00:00:01'; // date since which we want to see checkouts
const async = require('async');
const LibCalApi = require('../classes/LibCalApi');
const libCalConf = require('../config/libCal');
const appConf = require('../config/appConf');

// on startup, run TheBusiness once, then wait for subsequent Express requests
TheBusiness();

async function TheBusiness() {
  // Get LibCal Token
  try {
    lcApi = new LibCalApi(libCalConf);
    const lcToken = await lcApi.getToken();
    console.debug('LibCal token:', lcToken);
  } catch {
    console.error('Unable to get LibCal Token');
  }

  // Get LibCal Lists
  let lcUserList = {};
  try {
    let lcSoftware = await lcApi.getLibCalLists();
    lcSoftware = lcApi.mapLibCal2ShortName(lcSoftware, appConf.software);
    console.debug(JSON.stringify(lcSoftware, null, 4));

    await async.eachOf(lcSoftware, async (software) => {
      if (software.bookings.length > 0) {
        let lcBookings = lcApi.getCurrentLibCalBookings(software.bookings);
        console.debug('LibCal bookings:', software.shortName, lcBookings);
        lcUserList[software.shortName] = lcBookings;
      }
    });

    // console.log('LibCal bookings:', lcUserList);
    ShowRecentCheckouts(lcUserList);
  } catch (err) {
    console.error('Error getting LibCal lists:', err);
  }
}

function ShowRecentCheckouts(bookings) {
  console.log('just showing users checked out since:', displaySinceDate);
  patrons = bookings.adobecc.filter(
    (b) => Date.parse(b.fromDate) > Date.parse(displaySinceDate)
    // (b) => Date.parse(b.toDate < Date.parse())
  );
  staff = bookings['adobecc-libstaff'].filter(
    (b) => Date.parse(b.fromDate) > Date.parse(displaySinceDate)
  );
  console.log(patrons);
  console.log(staff);
  console.log('Summary of new checkouts since ' + displaySinceDate);
  console.log('patrons:', patrons.length);
  console.log('staff:', staff.length);
}
