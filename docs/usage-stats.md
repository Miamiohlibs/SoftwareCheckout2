# Usage Stats

LibCal keeps a record of all the request. You can fetch the daily raw stats with a command-line tool by running: `node getUsageData` That will prompt you for the beginning and end dates of the data you want to collect, and will prompt you to identiy which software package you want to collect data for.

It will query the LibCal API one day at a time, once every 1500ms -- so it will take about 45 seconds per month of data you request.

You can get a summary of stats for the full time period by running: `node usageStatsReport` which will retrieve the total bookings and total unique users for the stats collected with the getUsageData script (above).

#### Deidentified info for each checkout

Run `node logEachCheckout` to (re)generate a json file containing one entry per checkout. The results will appear in the `logs/eachCheckout/` folder -- one file per software package, and one file containing all checkouts for all packages.

#### Deidentify all stats

The `getUsageData` script downloads each day's data into a folder for each software package (e.g. `/logs/AdobeCC`), and the data includes identifying details such as name and email address. To deidentify the data, run `node anonymizeStats`. This will move each day's data to an "anon" subfolder (e.g. `logs/AdobeCC/anon`), and the identifying LibCal fields will be hashed using the `md5` algorithm. The identifiers will still be unique, but they will not be decryptable to reveal the identity of the users. All of the other stats functions can read data from both the identifiable folder and the anonymous data folder, so it's ok to have a mix of newer data still identifiable and some older data that has been deidentified.

#### Total license usage on a daily basis

Get all usage by date and license category in one file using: `node dailyUsageSummary.js`

If there are any dates or licenses not covered, run `node usageStatsReport` (above) for the relevant licenses and dates and try again.

#### Count of checkouts by license (overall or for a given period)

To get a count of checkouts, you can run a `jq` like this (you may have to [install jq](https://stedolan.github.io/jq/download/) on your system first):

`jq '.[] | select(.status == "Confirmed") | {bookId} ' logs/dailyStats/AdobeCreativeCloud/* | grep bookId | sort | uniq | wc -l`

This reads each daily file, identifies each confirmed booking and returns the bookId, and hands over a list of all the bookIds including duplicates, then eliminates duplicates and counts the results. Note: this will look at every booking in the directory. To get all the results from one year you can modify the file path to something like `logs/dailyStats/AdobeCreativeCloud/2022*`. If you need a more nuanced range, you might consider copying the files you want to consider another directory, and then running the command on the whole directory.

#### Count of distinct users (overall or for a given period)

Similar to above, count distinct user emails instead of booking ids: `jq '.[] | select(.status == "Confirmed") | {email} ' logs/dailyStats/AdobeCreativeCloud/* | grep email | sort | uniq | wc -l`

#### Report Adobe Savings

Adobe Creative Cloud licenses are available on a month-to-month basis. At the time of this writing, student licenses cost $20/month. We can get an estimate of how much money our students saved by not purchasing monthly licenses by running: `node savingsReporter.js`

More information about how this figure is calculated is in the `models/AdobeSavingsCalculator.js` file.
