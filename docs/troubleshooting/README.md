# Troubleshooting

## Log Analysis

The system logs a log of information, including "error", "info", and "debug" levels, all in the `logs/` directory. The most comprehensive logs are the debug logs, which include all logged events; the "info" logs include all error and info level events; the "error" logs only include information logged at the "error" level.&#x20;

### Viewing the Logs

Logs may be browsed/viewed through the [Admin Web Console](../setup/admin-web-console.md) through the "`/logs`" route, or on the command line by browsing the file structure.&#x20;

#### Admin Web Console

In the admin web console, you can view log files for each day or month (depending on how the log files are set up in [App Configuration](../setup/app-configuration.md#loglevels-required).) There are separate links for Error, Info, and Debug logs. The Debug logs are the most detailed.&#x20;

When you click on an individual log (e.g. debug-2024-10-01.log) you'll see a list of each time the main app process ran -- each run will be assigned a separate UID. Each UID will list the time it started, the number of entries in the log, and the first message in the log. Clicking on a UID entry will reveal all the events logged for that UID. The report for each UID will list the time, entry type, and message for that log entry; clicking on the entry will reveal any additional information recorded in the log entry.

#### Command-line analysis

The files log information in JSON format, but the whole file isn't actually JSON -- it's mutliple individual lines of JSON. In order to parse a logfile (e.g. `logs/info-2024-06.log`), use  the`parselog/jsonifylogs.js` script:

`node parselog/jsonifylogs logs/info-2024-06.log`

That will create a json array of the log entries, which can then be parsed using the command-line tool `jq`. Each log entry has several short elements: message, timestamp, uid; where appropriate, two other elements may be included: content and status. The content will sometimes be very long -- long strings of json or xml from API calls, for example.&#x20;

If logs are long and slow to process, you may want to create snippets of logs that focus in on the events or time period you're interested in, using `grep` or similar tools, e.g.

`grep '2024-06-06 12' logs/info-2024-06.log > parselogs/example1.log`

You an also examine log entries from a particular timeframe, you can use `jq` to limit down to a particular timeframe and reveal only certain fields, e.g.:&#x20;

`node parselogs/jsonifylogs.js logs/info-2024-06.log | jq '.[] | select(.timestamp | startswith("2024-06-06 12:5")) | { message,level,uid }'`

or

`node parselogs/jsonifylogs.js parselogs/example1.log | jq '.[] | {message,level,uid}'`

This command jsonifies the log, pipes it to jq for parsing, select only the lines with a timestamp between 12:50 and 12:59 of June 6, and then displays only three lines of those entries: message,level,uid.&#x20;

If a particular entry is of interest, perhaps an  error message:&#x20;

```
{
  "message": "JamfAPI: Error submitting Jamf GET query",
  "level": "error",
  "uid": "5d33bdd3e83"
}
```

Then you can use jq to extract the desired entryby its uid for examination:

`node parselogs/jsonifylogs.js parselogs/example1.log | jq '.[] | select(.uid=="5d33bdd3e83")'`

This will return the whole error message, in this case from an API call, with details of the failed query. &#x20;

Using jq to parse the logs is tedious, but effective.&#x20;



### Help with jq syntax

See the [Guide to Linux jq Command for JSON Processing](https://www.baeldung.com/linux/jq-command-json) for a good introduction to jq. For help writing custom jq queries, I have also found ChatGPT to be pretty good at turning requests into usable syntax.&#x20;

