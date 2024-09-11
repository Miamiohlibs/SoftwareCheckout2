const config = require('../config/appConf');
const { readdirSync } = require('fs');
const path = require('path');

module.exports = class StatsSummary {
  constructor() {
    this.allPkgData = [];
    this.summaries = [];
    let thisDir = path.dirname(__filename);
    this.statsPath = path.join(thisDir, '../logs/dailyStats');
    this.pkgs = this.getDirectories(this.statsPath);
  }

  getDirectories(source) {
    return readdirSync(source, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  }

  summarize = (pkgName, data, first, last) => {
    let span = '';
    if (first && last) {
      span = `(${first}-${last})`;
    }
    data = data.filter((d) => d.status === 'Confirmed');
    let bookIds = [...new Set(data.map((item) => item.bookId))];
    let totalBookings = bookIds.length;
    let totalUsers = [...new Set(data.map((item) => item.email))].length;
    return { pkgName, span, totalBookings, totalUsers };
  };

  getEarlierDate(dateOne, dateTwo) {
    const parsedDateOne = dateOne ? new Date(dateOne) : null;
    const parsedDateTwo = dateTwo ? new Date(dateTwo) : null;
    if (!parsedDateOne && !parsedDateTwo) {
      return null;
    }
    if (!parsedDateOne) {
      return dateTwo;
    }
    if (!parsedDateTwo) {
      return dateOne;
    }
    return parsedDateOne < parsedDateTwo ? dateOne : dateTwo;
  }

  getLaterDate(dateOne, dateTwo) {
    const parsedDateOne = dateOne ? new Date(dateOne) : null;
    const parsedDateTwo = dateTwo ? new Date(dateTwo) : null;
    if (!parsedDateOne && !parsedDateTwo) {
      return null;
    }
    if (!parsedDateOne) {
      return dateTwo;
    }
    if (!parsedDateTwo) {
      return dateOne;
    }
    return parsedDateOne > parsedDateTwo ? dateOne : dateTwo;
  }

  summarizeEachPkg() {
    this.pkgs.forEach((pkg) => {
      let thisdata = [];
      let thisfolder = this.statsPath + '/' + pkg + '/';
      let files = [];
      let anonFiles = [];

      if (readdirSync(thisfolder, { withFileTypes: true }).length > 0) {
        files = readdirSync(thisfolder, { withFileTypes: true })
          .filter((dirent) => dirent.isFile())
          .map((dirent) => dirent.name);
      }
      // if folder has an anon subfolder, add those files to the data
      let anonFolder = thisfolder + 'anon/';
      if (readdirSync(anonFolder, { withFileTypes: true }).length) {
        anonFiles = readdirSync(anonFolder, { withFileTypes: true })
          .filter((dirent) => dirent.isFile())
          .map((dirent) => dirent.name);
        // files = files.concat(anonFiles);
      }
      files.forEach((file) => {
        let data = require(thisfolder + file);
        thisdata = thisdata.concat(data);
        this.allPkgData = this.allPkgData.concat(data);
      });
      anonFiles.forEach((file) => {
        let data = require(anonFolder + file);
        thisdata = thisdata.concat(data);
        this.allPkgData = this.allPkgData.concat(data);
      });

      let filesFirst = '';
      let filesLast = '';
      let anonFirst = '';
      let anonLast = '';

      if (files.length) {
        filesFirst = files[0].replace('.json', '');
        filesLast = files[files.length - 1].replace('.json', '');
      }
      if (anonFiles.length) {
        anonFirst = anonFiles[0].replace('.json', '');
        anonLast = anonFiles[anonFiles.length - 1].replace('.json', '');
      }

      let first = this.getEarlierDate(filesFirst, anonFirst);
      let last = this.getLaterDate(filesLast, anonLast);
      this.summaries.push(this.summarize(pkg, thisdata, first, last));
    });
    this.summaries.push(this.summarize('All', this.allPkgData));
  }
};
