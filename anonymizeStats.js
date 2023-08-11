/* Description: 
 for each folder in the logs/dailyStats folder,
 create an "anon" subfolder
 and copy into it the daily stats files with the same name but anonymized
 */

const fs = require('fs');
const path = require('path');
const appConf = require('./config/appConf');
const secret = appConf.cryptoConfig.secret;
const StatsAnonymizer = require('./models/StatsAnonymizer');
const anon = new StatsAnonymizer(secret);

// foreach folder in logs/dailyStats
const dailyStatsDir = path.join(__dirname, 'logs', 'dailyStats');
const dailyStatsFolders = fs
  .readdirSync(dailyStatsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);
dailyStatsFolders.forEach((folder) => {
  // create an "anon" subfolder if none exists
  const anonFolder = path.join(dailyStatsDir, folder, 'anon');
  if (!fs.existsSync(anonFolder)) {
    fs.mkdirSync(anonFolder);
  }
  // for each file in the folder
  const folderPath = path.join(dailyStatsDir, folder);
  const files = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
  files.forEach((file) => {
    // read the file as an array of objects
    const filePath = path.join(folderPath, file);
    const data = fs.readFileSync(filePath, 'utf8');
    const arr = JSON.parse(data);
    // anonymize each object

    const anonArr = [];
    arr.forEach((obj) => {
      let res = anon.anonymizeObject(obj, [
        'firstName',
        'lastName',
        'email',
        'account',
      ]);
      anonArr.push(res);
    });
    // write the array of objects to a new file in the anon subfolder
    const anonFilePath = path.join(anonFolder, file);
    fs.writeFileSync(anonFilePath, JSON.stringify(anonArr, null, 2));
    // delete original file
    fs.unlinkSync(filePath);
  });
});
