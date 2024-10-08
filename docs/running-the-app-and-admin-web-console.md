# Running the App & Admin Web Console

### Running the app

There are several ways to run the app from the command line:

* `node app` - run once
* PRODUCTION: `npm run server`: will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is
* `node jamfUserUpdate` - for unknown reasons, the process for adding Jamf users wasn't working in the main app, so we spun it off as its own process that should run prior to running the app. It should be run _before_ the main app.

#### Running as a cron job

The app just runs once when you run one of the above commands. To make the service useful, you should run it frequently -- every 10-15 minutes. Set up a cron job to run the service in production a few times an hour, and run the jamfUserUpdate before it (if using Jamf):

`1,13,25,37,49 * * * * /usr/bin/node /opt/dev/SoftwareCheckout2/jamfUserUpdate.js > /dev/null 2>&1` \
`2,14,26,38,50 * * * * /usr/bin/node /opt/dev/SoftwareCheckout2/app.js --name=Software-Checkout > /dev/null 2>&1`&#x20;

You will likely want to run the daily stats update as a cron job too -- that is described in the [Usage Stats](usage-stats.md) page.

#### Killing / restarting the app

* run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
* `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)

## Running the admin web console

Unlike the main app, which runs as a "headless" process with no native user interface, the admin web console is a web-based service. For information on setting up and running the web process see [Express Web Setup](setup/admin-web-console.md#express-server-setup).
