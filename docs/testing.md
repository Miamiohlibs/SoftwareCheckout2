---
description: Testing code and configuration
---

# Testing

### Unit tests

Run unit tests with `npm test`.

Note: `./test/models/AdobeApi-async.test.js` tests the integration of the code with the Adobe User Management API. It requires a locally-created file, `/config/test/adobe.testConf.js` to have been prepared with an Adobe group using a real vendorGroupId; there are also some variables that must be set up with the email addresses of valid, current, local users. Create this file by copying the `/config/test/adobe.testConf.sample.js` file to `/config/test/adobe.testConf.js` and editing it with your local information.

### Demo parts of the app

The `demo` folder contains a few command-line scripts that can be used to test parts of the app without running the whole thing.

* `node demo/libCalApi.js` - test the LibCal API
  * this script will prompt you with a list of software packages and ask you to select one; it will retrieve the current booking for that package and display the results
* `node demo/adobeApi.js` - test the Adobe API
  * this will let you fetch the list of current entitlements for a given license group, and add or subtract a user from that group
  * relies on the `config/appConf.js` file to identify the license group to use, and on the `config/adobe.js` file to identify the API credentials
* `node demo/jamfApi.js` - test the Jamf API
  * this will let you fetch the list of current users in a given license group, and add or subtract a user from that group
  * relies on the `config/appConf.js` file to identify the license group to use, and on the `config/jamf.js` file to identify the API credentials
