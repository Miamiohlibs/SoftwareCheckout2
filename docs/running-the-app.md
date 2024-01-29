# Running the App

### Running the app

* `node app` - run once
* PRODUCTION: `npm run server`: will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is
* `node jamfUserUpdate` - for unknown reasons, the process for adding Jamf users wasn't working in the main app, so we spun it off as its own process that should run prior to running the app.

#### Killing / restarting the app

* run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
* `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)
