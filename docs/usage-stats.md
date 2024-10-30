# Usage Stats

## Harvesting Stats from LibCal

The Software Checkout app doesn't collect stats on its own, but it can query LibCal for usage stats. The easiest way to access this data is through the Admin Web Console, which includes a stats module. You will likely want to import the resulting data to a spreadsheet for graphing and other analyses.&#x20;

Before the stats can be accessed through the web console, the data must be retrieved from LibCal. To do this on an ongoing basis, set up a cron job like this:

```
3 0 * * * /usr/bin/node /path/to/SoftwareCheckout2/getUsageData.js --startDate=yesterday --endDate=yesterday --libCalCid=all
4 0 * * * /usr/bin/node /path/to/SoftwareCheckout2/anonymizeStats.js
5 0 * * * /usr/bin/node /opt/dev/SoftwareCheckout2/logEachCheckout.js
```

1. The first script (getUsageData) collects the data from LibCal.&#x20;
2. The second one (anonymizeStats) strips identifying information on your users. You do not have to do this part, but it is recommended. (If you ever want data on your users, that's still available in LibCal.)
3. The third (logEachCheckout) writes one file per software package in the logs/eachCheckout folder containing a single entry per checkout, which can be used for some stats reporting purposes.

If you need to retroactively collect stats (rather than the recommended one-day-at-a-time cron job approach suggested above) you can do so using the `getUsageData.js` script which you can run interactively on the command-line as `node getUsageData` or with start and end dates specified like:&#x20;

```
node getUsageData.js --startDate=2021-02-01 --endDate=yesterday --libCalCid=all
```

or you can specify a single libCalCid to get stats for just one software package. See your `appConf.js` file for the correct cids.&#x20;

The getUsageData will query the LibCal API one day at a time, once every 1500ms -- so it will take about 45 seconds per month of data you request.

## Usage Stats in the Admin Web Console

The admin web console provides two kinds of stats:

1. **Daily Usage Stats** per software title: For each active software title, this will report how many licenses were in use each day. This is not "how many licenses were requested on this day", but "how many licenses were currently checked out during that day" -- so if a license was assigned to a user for a week, it would show up in the stats for each of the seven days during which it was assigned. You can also get this information on the command line by running `node dailyUsageSummary.js`. If there are any dates or licenses not covered, run `node usageStatsReport` (above) for the relevant licenses and dates and try again.
2. &#x20;**Usage Summary Stats** per software title: This lists the first and last dates covered by the stats that have been retrieved from LibCal for each title, along with the total bookings and the distinct users for each title. You can also get this information on the command line by running `node usageStatsReport`.
3. **Each Checkout:** this report generates one entry per time that someone checks out a software license. This can be useful as raw data for statistical reports that you may devise for your own purposes.
4. **Estimated Adobe Savings:** This function estimates how much money users would have spent if they had licensed Adobe Creative Cloud software from Adobe on a month-to-month basis rather than using Software Checkout. Some of the details are configurable in the `config/adobe.js` file. The mathematical model that powers this calculation is based on Miami University's current two-week checkout period for students. Other calculation models are possible but have not been developed yet.  You can get this report on the command line by running: `node savingsReporter.js` More information about how this figure is calculated is in the `models/AdobeSavingsCalculator.js` file.

## Additional command-line stats tools

Not all stats processes are yet included in the admin web console but can be performed from the command line. These are documented here.&#x20;

#### Deidentified info for each checkout

For some statistical purposes, it is useful to have a record of each individual checkout. To get this data on the command line, run `node logEachCheckout` to (re)generate a json file containing one entry per checkout. The results will appear in the `logs/eachCheckout/` folder -- one file per software package, and one file containing all checkouts for all packages. It is recommended that you do this as a nightly cron job to keep the information in your web console up-to-date.

#### Deidentify all stats

The `getUsageData` script downloads each day's data into a folder for each software package (e.g. `/logs/AdobeCC`), and the data includes identifying details such as name and email address. To deidentify the data, run `node anonymizeStats`. This will move each day's data to an "anon" subfolder (e.g. `logs/AdobeCC/anon`), and the identifying LibCal fields will be hashed using the `md5` algorithm. The identifiers will still be unique, but they will not be decryptable to reveal the identity of the users. All of the other stats functions can read data from both the identifiable folder and the anonymous data folder, so it's ok to have a mix of newer data still identifiable and some older data that has been deidentified. The admin web console can use any mix of identifiable and deidentified stats, but for your users' privacy, anonymous stats are to be preferred.&#x20;

#### Count of checkouts by license (overall or for a given period)

To get a count of checkouts, you can run a `jq` like this (you may have to [install jq](https://stedolan.github.io/jq/download/) on your system first):

`jq '.[] | select(.status == "Confirmed") | {bookId} ' logs/dailyStats/AdobeCreativeCloud/* | grep bookId | sort | uniq | wc -l`

This reads each daily file, identifies each confirmed booking and returns the bookId, and hands over a list of all the bookIds including duplicates, then eliminates duplicates and counts the results. Note: this will look at every booking in the directory. To get all the results from one year you can modify the file path to something like `logs/dailyStats/AdobeCreativeCloud/2022*`. If you need a more nuanced range, you might consider copying the files you want to consider another directory, and then running the command on the whole directory.

#### Count of distinct users (overall or for a given period)

Similar to above, count distinct user emails instead of booking ids: `jq '.[] | select(.status == "Confirmed") | {email} ' logs/dailyStats/AdobeCreativeCloud/* | grep email | sort | uniq | wc -l`

