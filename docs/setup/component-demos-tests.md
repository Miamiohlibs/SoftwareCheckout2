---
description: Interactive command-line options for dealing with parts of the app
---

# Component Demos/Tests

SoftwareCheckout relies on several interlocking parts; when setting up the service, it's nice to know if one part is working before moving on to configure another. The command-line tools in the `demo` folder can be used to test different parts of the app. The demos use the same configuration files as the app.

## libcal.demo.js

On the command-line, run `node demos/libcal.demo.js`

This will call up a list of all the software packages and permissions groups configured in `config/appConf.js;` can select one, and the software will return a list of all the users assigned to that permissions group in LibCal. You can select how much information to return about each checkout. From most-to-least information, the format options are: Full, Compressed, Mini, Email only.

## adobe.demo.js

On the command-line, run `node demos/adobe.demo.js`

This will allow you to:

* List the Adobe permissions groups
* List the users in a group
* Add a user to a group
* Remove a user from a group

## jamf.demo.js

On the command-line, run `node demos/jamf.demo.js`

This will allow you to:

* List the Jamf permissions groups
* List the users in a group
* Add a user to a group
* Remove a user from a group

## email.demo.js

On the command-line, run `node demos/email.demo.js`

You can use this if you have set `emailConverter.active: true` in `config/appConf.js` and configured the emailConverter API details (with or without a database setup) to look up the authoritative email address the system will use for your users. This can be an easy way to interact with your email database.

This will allow you to:

* Get unique email for user&#x20;
* Get all emails from the database
* Add an alias/unique Email pair to the database
* Delete an alias/unique Email pair from the database
