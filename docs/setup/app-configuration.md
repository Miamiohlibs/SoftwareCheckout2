# App Configuration

This repo comes with several `config/*.sample.js` files; copy each of them over to `config/*.js` (e.g. copy `config/adobe.sample.js` to `config/adobe.js` and update the values with local variables and API keys as indicated by the comments in the file.

### `config/appConf.js`:

This file defines which software packages and permissions groups are updated by the app. It also establishes logfile practices for the app, and creates options for handling users with aliased emails.&#x20;

#### `emailConverter` (set `active: false` if not used)

LibCal may accept users' aliased email addresss (e.g. my.full.name@fake.org) even though license providers may only use the uniqueId version of a user Id (e.g. namemf@fake.org). If your institution has an API that can get the authoritative email address, you can use the settings here to configure the url.&#x20;

* `.active`: When `emailConverter.active: true`, the app will look up each user email and get the authoriative username. In order for this to work, your organization will need a public API to perform this service.
* `.baseUrl` and `.endOfUrl`: In the emailConverter settings use the `baseUrl` and `endOfUrl` properties to establish the query URL for that api. (You may not need `endOfUrl` but it is provided in case the needed query does not end with the user's email, e.g. "https://fake.org/api/email/alias@fake.org/convert" would use `baseUrl: 'https://fake.org/api/email/'` and `endOfUrl: 'convert'`)
* `.objectPropForReturnValue`: the name of the nested property in the API's return value needed to access the uniqueId, e.g. `data.user.uid`
* `.affixSuffixToReturn`: true/false; indicates whether the value returned by the API will need to have an email "@..." added to it to create a valid email address. If the API returns 'user@fake.org' then set `affixSuffixToReturn: false` because the email address is complete. If the API just returns 'user', set `affixSuffixToReturn: true` so the app knows to append the rest of an email address.
* `.suffix`: the string to be appended to the unique Id returned by the API, e.g. `@fake.org`

#### `database` (set `active: false` if not used)

If using the emailConverter service to convert alias emails to authoritative emails, you may wish to cache already-converted emails in a MongoDB-compatible database. If you do so, use these settings to configure the database. The `use` value should be set to "test" or "prod" to specify whether to connect to the test database (usually on localhost) or to a production database (possibly hosted at MongoDB, AWS, or elsewhere). The `test` and `prod` objects contain Mongo-compatible connection string and configuration. (optional; used for caching converted email aliases)

By default `active` is set to `false`.

#### `logLevels` (required)

The app creates logfiles for "info", "error", and "debug" events (in order from least to most comprehensive). You can choose whether a new logfile is created each day or each month for each level. Use these settings to tailor the log files; allowed values for each level are: `false`, `'daily'`, or `'monthly'.` `false` for no logs at that level; `'daily'` for logs that start a new logfile each day; `'monthly'` for a new logfile per month. Use daily logs for levels that output obnoxiously large amounts of data like 'debug'. Currently, only 'info','error', and 'debug' are used by the app. Leave other levels set to `false`.

#### `software` (required)

This is an array of objects describing the connections between LibCal's names for the software and the related vendor permissions groups. One object per license group package; potentially multiple objects/license groups per vendor.

* `.active`: true/false: is this license currently being used/checked by the software
* `.vendor`: Software license vendor. Current allowed values: 'Adobe', 'Jamf'
* `.libCalName`: LibCal equipment category name (this is for human readability, not for the app)
* `.libCalCid`: LibCal CategoryID for the group (used by the app)
* `.vendorGroupName`: license group name (used by Adobe)
* `.vendorGroupId`: license group id (used by Jamf)
  * note: the Jamf dashboard will not tell you the group id, but it is available through their APIs /usergroups route. You can run `node demo/jamf-demo.js` on the command-line to query the API. Select the "List groups" option to show both which groups are set up in the `config/jamf.js` file and to see what groups exist in the Jamf dashboard. This query will return the list of Jamf dashboard groups along with their group ids, like:\
    \
    `{ name: 'Software Checkout Final Cut', id: 3 },` \
    `{ name: 'Software Checkout Logic Pro and Mainstage', id: 7 },` \
    `{ name: 'Software Checkout Procreate', id: 9 },` \
    `{ name: 'Software Checkout Test', id: 8 },`\


You will also need to set up LibCal and at least one vendor (Adobe and/or Jamf). See the following sections of this documentation for details on those.
