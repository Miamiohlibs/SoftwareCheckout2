# Software Checkout

Looks up software bookings from the LibCal API and updates the membership of corresponding license group in any of:

- Adobe Cloud
- Jamf

## Requirements

- Node.js
- LibCal subscription

### Adobe

- Adobe account with access to the User Management API
  - Adobe user management API documentation: https://adobe-apiplatform.github.io/umapi-documentation/en/
  - Adobe Admin Console: https://adminconsole.adobe.com/overview
  - Console Documentation: https://helpx.adobe.com/enterprise/managing/user-guide.html

### Jamf

Jamf is a mobile device management system that can also manage software licenses. This app uses the [Jamf Classic API](https://developer.jamf.com/jamf-pro/docs/getting-started-2) to add and remove users from license groups for Apple software packages.

### LibCal Setup

1. In LibCal's Equipment Checkout service, create a "Location" for software checkout and make note of the Location ID.
2. Create a separate "Location" for each different type of licensed software (e.g. Photoshop, Illustrator, InDesign, full Creative Cloud Suite)
3. Users will be able to checkout software at: https://youraccount.libcal.com/admin/equipment

### Adobe Setup

1. Using the [Adobe I/O Console](https://console.adobe.io/), create a new Project with an associated oAuth Server-to-Server credential.
2. Copy `config/adobe.sample.js` to `config/adobe.js` and add the Project details to that file (clientId, clientSecret,orgId)

## App Configuration

This repo comes with several `config/*.sample.js` files; copy each of them over to `config/*.js` e.g. `config/adobe.js` and update the values with local variables and API keys as indicated by the comments in the file.

Request API keys from LibCal and Adobe. You will enter these values in the configs described below.

- `config/appConf.js`:

  - `db_connection`: mongodb connection string (optional; used for caching converted email aliases)
  - `logLevels`: for each level, set one of: false, 'daily', 'monthly'; false for no logs at that level; 'daily' for logs that start a new logfile each day; 'monthly' for a new logfile per year. Use daily logs for levels that output obnoxiously large amounts of data like 'debug'. Currently, only 'info','error', and 'debug' are used by the app.
  - `emailConverter`: LibCal may accept users' aliased email addresss (e.g. my.full.name@fake.org) even though license providers may only use the uniqueId version of a user Id (e.g. namemf@fake.org).
    - `.active`: When `emailConverter.active: true`, the app will look up each user email and get the authoriative username. In order for this to work, your organization will need a public API to perform this service.
    - `.baseUrl` and `.endOfUrl`: In the emailConverter settings use the `baseUrl` and `endOfUrl` properties to establish the query URL for that api. (You may not need `endOfUrl` but it is provided in case the needed query does not end with the user's email, e.g. "https://fake.org/api/email/alias@fake.org/convert" would use `baseUrl: 'https://fake.org/api/email/'` and `endOfUrl: 'convert'`)
    - `.objectPropForReturnValue`: the name of the property in the API's return value needed to access the uniqueId, e.g. `data.user.uid`
    - `.affixSuffixToReturn`: true/false; indicates whether the value returned by the API will need to have an email "@..." added to it to create a valid email address. If the API returns 'user@fake.org' then set `affixSuffixToReturn: false` because the email address is complete. If the API just returns 'user', set `affixSuffixToReturn: true` so the app knows to append the rest of an email address.
    - `.suffix`: the string to be appended to the unique Id returned by the API, e.g. `@fake.org`
  - `software`: array of objects descibing the connections between LibCal's names for the software and the related vendor permissions groups. One object per license group package; potentially multiple objects/license groups per vendor.
    - `.active`: true/false: is this license currently being used/checked by the software
    - `.vendor`: Software license vendor. Current allowed values: 'Adobe', 'Jamf'
    - `.libCalName`: LibCal equipment category name (this is for human readability, not for the app)
    - `.libCalCid`: LibCal CategoryID for the group (used by the app)
    - `.vendorGroupName`: license group name (used by Adobe)
    - `.vendorGroupId`: license group id (used by Jamf)

- `config/libCal.js`: includes API key, config for requesting an API token, and query config for making API requests with the token.
  - update the softwareLocation with the Location ID you created for Software Checkout in LibCal
  - update the `client` values with the client ID and client_secret API keys you get from LibCal
  - in the `auth` and `queryConfig` objects, enter the name of your libcal server (e.g. `miamioh.libcal.edu`) - include the `https://` only where indicated in the sample file
- `config/adobe.js`: includes API credentials, route to private key, and query config
  - the API credential are supplied when you request and API key from Adobe
  - as part of the API setup, you will create a public and private key pair; upload the public key to Adobe and store the private key in the `certs/` folder as `private.key`
  - the `queryConfig` does not need to be altered from `config/adobe.sample.js`

## Running the app

- `node app` - run once
- PRODUCTION: `npm run server`: will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is

- `node jamfUserUpdate` - for unknown reasons, the process for adding Jamf users wasn't working in the main app, so we spun it off as its own process that should run prior to running the app.

### Killing / restarting the app

- run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
- `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)

## Testing the App

### Unit tests

Run unit tests with `npm test`.

### Demo parts of the app

The `demo` folder contains a few command-line scripts that can be used to test parts of the app without running the whole thing.

- `node demo/libCalApi.js` - test the LibCal API

  - this script will prompt you with a list of software packages and ask you to select one; it will retrieve the current booking for that package and display the results

- `node demo/adobeApi.js` - test the Adobe API

  - this will let you fetch the list of current entitlements for a given license group, and add or subtract a user from that group
  - relies on the `config/appConf.js` file to identify the license group to use, and on the `config/adobe.js` file to identify the API credentials

- `node demo/jamfApi.js` - test the Jamf API
  - this will let you fetch the list of current users in a given license group, and add or subtract a user from that group
  - relies on the `config/appConf.js` file to identify the license group to use, and on the `config/jamf.js` file to identify the API credentials

## Stats

LibCal keeps a record of all the request. You can fetch the daily raw stats with a command-line tool by running:
`node getUsageData`
That will prompt you for the beginning and end dates of the data you want to collect, and will prompt you to identiy which software package you want to collect data for.

It will query the LibCal API one day at a time, once every 1500ms -- so it will take about 45 seconds per month of data you request.

You can get a summary of stats for the full time period by running:
`node usageStatsReport`
which will retrieve the total bookings and total unique users for the stats collected with the getUsageData script (above).

### Deidentified info for each checkout

Run `node logEachCheckout` to (re)generate a json file containing one entry per checkout. The results will appear in the `logs/eachCheckout/` folder -- one file per software package, and one file containing all checkouts for all packages.

### Deidentify all stats

The `getUsageData` script downloads each day's data into a folder for each software package (e.g. `/logs/AdobeCC`), and the data includes identifying details such as name and email address. To deidentify the data, run `node anonymizeStats`. This will move each day's data to an "anon" subfolder (e.g. `logs/AdobeCC/anon`), and the identifying LibCal fields will be hashed using the `md5` algorithm. The identifiers will still be unique, but they will not be decryptable to reveal the identity of the users. All of the other stats functions can read data from both the identifiable folder and the anonymous data folder, so it's ok to have a mix of newer data still identifiable and some older data that has been deidentified.

### Total license usage on a daily basis

Get all usage by date and license category in one file using: `node dailyUsageSummary.js`

If there are any dates or licenses not covered, run `node usageStatsReport` (above) for the relevant licenses and dates and try again.

### Count of checkouts by license (overall or for a given period)

To get a count of checkouts, you can run a `jq` like this (you may have to [install jq](https://stedolan.github.io/jq/download/) on your system first):

`jq '.[] | select(.status == "Confirmed") | {bookId} ' logs/dailyStats/AdobeCreativeCloud/* | grep bookId | sort | uniq | wc -l`

This reads each daily file, identifies each confirmed booking and returns the bookId, and hands over a list of all the bookIds including duplicates, then eliminates duplicates and counts the results. Note: this will look at every booking in the directory. To get all the results from one year you can modify the file path to something like `logs/dailyStats/AdobeCreativeCloud/2022*`. If you need a more nuanced range, you might consider copying the files you want to consider another directory, and then running the command on the whole directory.

### Count of distinct users (overall or for a given period)

Similar to above, count distinct user emails instead of booking ids:
`jq '.[] | select(.status == "Confirmed") | {email} ' logs/dailyStats/AdobeCreativeCloud/* | grep email | sort | uniq | wc -l`

### Report Adobe Savings

Adobe Creative Cloud licenses are available on a month-to-month basis. At the time of this writing, student licenses cost $20/month. We can get an estimate of how much money our students saved by not purchasing monthly licenses by running:
`node savingsReporter.js`

More information about how this figure is calculated is in the `models/AdobeSavingsCalculator.js` file.

## Credits

Developed by [Ken Irwin](irwinkr@miamioh.edu) at Miami University, in cooperation with Michael Bomholt.
