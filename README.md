# Software Checkout

Looks up software bookings from the LibCal API and updates the membership of corresponding Adobe Admin Console user groups.

## Requirements

- Node.js
- LibCal subscription
- Adobe account with access to the User Management API
  - Adobe user management API documentation: https://adobe-apiplatform.github.io/umapi-documentation/en/
  - Adobe Admin Console: https://adminconsole.adobe.com/overview
  - Console Documentation: https://helpx.adobe.com/enterprise/managing/user-guide.html

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
  - `nodePort`: the port this app will run on; default is 9000, but you may want to change that according to local needs.
  - `server`: if your setup inlucdes triggering the app to update using an https call, give your server's fully-qualified hostname, along with the paths to the SSL certificate and key. (See "Running the App" below.)
  - `software`: object descibing the connections between LibCal's names for the software and the related Adobe permissions groups
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
- `node app --listen` - run once, then listen on port 9000 (or port specified in campusIT.nodePort) for subsequent updates
- PRODUCTION: `npm run server`: will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is

There are two main ways to run the app. You can set it up to run as a web server using the built in express app features, or you can run it just-once on a periodic basis using `node app` on a cron job. The advantage of the web server setup is that you can set LibCal to to trigger a call to the website everytime a checkout is initiated. That will update the permissions in the Adobe group almost instantly (less that 15 seconds). But it requires that you are able to set up a server running Node.js over https. If setting up a Node.js-capable web server is not suitable for your situation, you can run the Software Checkout app using `node app` on a cronjob, e.g. every 15, 30, or 60 minutes. This requires less setup but introduces some lag time between the patron request and the update to the permissions.

### Killing / restarting the app

- run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
- `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)

## Log files

- `./lastlog.sh`: displays the output of the last update (from `logs/app.log`)

### THESE LOGS ARE NOT CURRENTLY IN PLACE:

- `logs/app.log`: logs console/STDOUT and STDERR when the app runs (chiefly at startup and whenever someone hits ths url)
- `bookings.log`: most recent copy of the bookings API call from LibCal
- `categories.log`: most recent copy of the categories API call from LibCal
- `locations.log`: most recent copy of the locations API call from LibCal
