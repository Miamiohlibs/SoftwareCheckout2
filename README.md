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

[need more info here]

### LibCal Setup

1. In LibCal's Equipment Checkout service, create a "Location" for software checkout and make note of the Location ID.
2. Create a separate "Location" for each different type of licensed software (e.g. Photoshop, Illustrator, InDesign, full Creative Cloud Suite)
3. Users will be able to checkout software at: https://youraccount.libcal.com/admin/equipment

### Adobe Setup

1. Using the [Adobe I/O Console](https://console.adobe.io/), create a new Project with an associated Service Account (JWT).
2. Put the `private.key` file from the certificate in the `certs/` folder of this project. BEWARE: certs expire after a year; you'll want to set a reminder to renew them before they expire
3. Copy `config/adobe.sample.js` to `config/adobe.js` and add the Project details to that file (clientId, clientSecret,orgId,technicalAccountId)

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

### Killing / restarting the app

- run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
- `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)
