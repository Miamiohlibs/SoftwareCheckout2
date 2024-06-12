# App Configuration

### App Configuration

This repo comes with several `config/*.sample.js` files; copy each of them over to `config/*.js` e.g. `config/adobe.js` and update the values with local variables and API keys as indicated by the comments in the file.

Request API keys from LibCal and Adobe. You will enter these values in the configs described below.

* `config/appConf.js`:
  * `db_connection`: mongodb connection string (optional; used for caching converted email aliases)
  * `logLevels`: for each level, set one of: false, 'daily', 'monthly'; false for no logs at that level; 'daily' for logs that start a new logfile each day; 'monthly' for a new logfile per year. Use daily logs for levels that output obnoxiously large amounts of data like 'debug'. Currently, only 'info','error', and 'debug' are used by the app.
  * `emailConverter`: LibCal may accept users' aliased email addresss (e.g. my.full.name@fake.org) even though license providers may only use the uniqueId version of a user Id (e.g. namemf@fake.org).
    * `.active`: When `emailConverter.active: true`, the app will look up each user email and get the authoriative username. In order for this to work, your organization will need a public API to perform this service.
    * `.baseUrl` and `.endOfUrl`: In the emailConverter settings use the `baseUrl` and `endOfUrl` properties to establish the query URL for that api. (You may not need `endOfUrl` but it is provided in case the needed query does not end with the user's email, e.g. "https://fake.org/api/email/alias@fake.org/convert" would use `baseUrl: 'https://fake.org/api/email/'` and `endOfUrl: 'convert'`)
    * `.objectPropForReturnValue`: the name of the property in the API's return value needed to access the uniqueId, e.g. `data.user.uid`
    * `.affixSuffixToReturn`: true/false; indicates whether the value returned by the API will need to have an email "@..." added to it to create a valid email address. If the API returns 'user@fake.org' then set `affixSuffixToReturn: false` because the email address is complete. If the API just returns 'user', set `affixSuffixToReturn: true` so the app knows to append the rest of an email address.
    * `.suffix`: the string to be appended to the unique Id returned by the API, e.g. `@fake.org`
  * `software`: array of objects descibing the connections between LibCal's names for the software and the related vendor permissions groups. One object per license group package; potentially multiple objects/license groups per vendor.
    * `.active`: true/false: is this license currently being used/checked by the software
    * `.vendor`: Software license vendor. Current allowed values: 'Adobe', 'Jamf'
    * `.libCalName`: LibCal equipment category name (this is for human readability, not for the app)
    * `.libCalCid`: LibCal CategoryID for the group (used by the app)
    * `.vendorGroupName`: license group name (used by Adobe)
    * `.vendorGroupId`: license group id (used by Jamf)

You will also need to configure LibCal, as well at least one vendor (e.g. Adobe and/or Jamf)
