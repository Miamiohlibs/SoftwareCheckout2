const fs = require('fs');
const path = require('path');

module.exports = class StatsSummary {
  constructor() {
    this.allData = [];
    let thisDir = path.dirname(__filename);
    this.statsPath = path.join(thisDir, '../logs/dailyStats');
  }

  summarizeStats(softwareTitles) {
    softwareTitles.forEach((softwareTitle) => {
      let folder = softwareTitle.replace(/ /g, '');
      // get all files that aren't directories
      let files, anonFiles;
      if (fs.existsSync(`${this.statsPath}/${folder}`) != false) {
        files = fs.readdirSync(`${this.statsPath}/${folder}`, {
          withFileTypes: true,
        });
        try {
          anonFiles = fs.readdirSync(`${this.statsPath}/${folder}/anon`, {
            withFileTypes: true,
          });
        } catch (err) {
          anonFiles = [];
        }
        files.push(...anonFiles); // all files, anonymous and not
        files = [...new Set(files)]; // remove duplicates
        files = files.filter((file) => file.isFile()); // remove directories
        files.sort((a, b) => (a.name > b.name ? 1 : -1)); // sort by date
        files.forEach((file) => {
          let date = file.name.split('.')[0];
          let usage = this.getDateStats(softwareTitle, date);
          this.updateOrAddEntry({ date, softwareTitle, usage });
        });
      }
    });
    return this.allData;
  }

  updateOrAddEntry(newEntry) {
    let found = false;

    for (let i = 0; i < this.allData.length; i++) {
      if (this.allData[i].date === newEntry.date) {
        this.allData[i][newEntry.softwareTitle] = newEntry.usage;
        found = true;
        break;
      }
    }

    if (!found) {
      let obj = {
        date: newEntry.date,
        [newEntry.softwareTitle]: newEntry.usage,
      };
      this.allData.push(obj);
    }
  }

  getDateStats(softwareTitle, date) {
    let folder = softwareTitle.replace(/ /g, '');
    let filepath = `${this.statsPath}/${folder}/${date}.json`;
    let anonpath = `${this.statsPath}/${folder}/anon/${date}.json`;
    let data;
    if (fs.existsSync(filepath)) {
      data = require(`${this.statsPath}/${folder}/${date}.json`);
    } else if (fs.existsSync(anonpath)) {
      data = require(`${this.statsPath}/${folder}/anon/${date}.json`);
    } else {
      console.log('No file found for ' + softwareTitle + ' on ' + date);
      return;
    }
    let confirmedBookings = data.filter((item) => item.status == 'Confirmed');
    let skipCheckins = confirmedBookings.filter(
      (item) => !item.toDate.match(date + 'T00:00:00')
    );
    let distinctUsers = [...new Set(skipCheckins.map((item) => item.email))];
    let totalUsage = distinctUsers.length;
    // console.log(softwareTitle + ',' + date + ',' + totalUsage);
    return totalUsage;
  }
};
