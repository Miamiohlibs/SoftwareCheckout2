# Admin Web Console

The admin web console is a Node + Express app that runs as a separate process from the main Node app that powers the service. The web console provides a read-only look at several kinds of content of interest to the project admin: current system status, logs, and stats.&#x20;

## Google Authentication Setup

The web console uses Google for authentication. You can set requireLogin to true or false in the "admin" section of the appConf.js. You should leave it turned on once your setup is complete, but you may find it easiest to get leave the authentication setup until after you've got the console working. Every time you restart the service, you will have to log in via Google again, so leaving authentication turned off can be useful when troubleshooting.

To set up authentication, log into the [Google Cloud Developer Console](https://console.cloud.google.com/apis/dashboard?) and create a new project called "Software Checkout Admin" or something similar. Under "APIs & Services", click the "Credentials" tab and then "+ Create Credentials" and "OAuth client ID". Select these options:

* Application type: Web Application
* Name: Software Checkout Admin
* Authorized redirect URIs (the server and port where you'll run the app) -- you may wish to setup both localhost (to test on a computer) and a server instance:
  * http://localhost:3010/google/callback
  * https://your.organization.edu:3010/google/callback&#x20;

This will generate a Client ID and Client Secret -- use those values in the `appConf.js` file in the "admin" setup. The "Authorized redirect URI" value will be used as the "authCallback" value in the config file. &#x20;

With the Google setup complete, the values added to the `appConf.js` file, and the "requireLogin" value set to "true" in `appConf.js`, you should be able to (and required to) log in to the app once it's started. (You can start it using `node www/index` from the command line of the main Software Checkout directory.)&#x20;

## Express Server Setup

You will need to run the process on an available port; the default is 3010, but you can choose a different port if that is not convenient. You'll need that port to be open on the server. (This should not be an issue when testing on localhost on personal computer.)&#x20;

For temporary / testing purposes, you can start it using `node www/index` from the command line of the main Software Checkout directory. The most reliable way to run the app and keep it running on the server is to use the [pm2](https://pm2.keymetrics.io/) process manager to keep the app alive. With pm2 installed on your server, you can start the process with a command like `pm2 www/index.js -n soft-chkout-3010` -- the "soft-chkout-3010" can be any text you want to use to identify the process; including the port number in the process label can be helpful later. You can run it without any label, but having a process named "index" is not very helpful! &#x20;

