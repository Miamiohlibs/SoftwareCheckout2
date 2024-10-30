const config = require('../config/appConf');
const { readdirSync } = require('fs');
const path = require('path');
const logger = require('../services/logger');
const { all } = require('../www/routes/api');

module.exports = class StatsSummary {
  constructor() {
    this.allPkgData = [];
    this.summaries = [];
    this.overallFirst = '';
    this.overallLast = '';
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
    let distinctUsers = [...new Set(data.map((item) => item.email))].length;
    return { pkgName, first, last, totalBookings, distinctUsers };
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

  summarizeEachPkg(reportStartDate = '', reportEndDate = '') {
    this.reportStartDate = reportStartDate;
    this.reportEndDate = reportEndDate;
    this.pkgs.forEach((pkg) => {
      let thisdata = [];
      let thisfolder = this.statsPath + '/' + pkg + '/';
      let files = [];
      let anonFiles = [];

      try {
        if (readdirSync(thisfolder, { withFileTypes: true }).length > 0) {
          files = readdirSync(thisfolder, { withFileTypes: true })
            .filter((dirent) => dirent.isFile())
            .map((dirent) => dirent.name);
        }
      } catch (err) {
        logger.debug('StatsSummary.js: unable to open log folder', {
          content: err,
        });
      }

      // if folder has an anon subfolder, add those files to the data
      let anonFolder = thisfolder + 'anon/';
      try {
        // anon folder may not exist
        if (readdirSync(anonFolder, { withFileTypes: true }).length) {
          anonFiles = readdirSync(anonFolder, { withFileTypes: true })
            .filter((dirent) => dirent.isFile())
            .map((dirent) => dirent.name);
        }
      } catch (err) {
        logger.debug('StatsSummary.js: unable to open "anon" log folder', {
          content: err,
        });
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

      if (reportStartDate != '') {
        files = files.filter((file) => {
          return file >= this.reportStartDate + '.json';
        });
        anonFiles = anonFiles.filter(
          (file) => file >= this.reportStartDate + '.json'
        );
        thisdata = thisdata.filter((item) => {
          return item.toDate >= this.reportStartDate;
        });
        this.allPkgData = this.allPkgData.filter((item) => {
          return item.toDate >= this.reportStartDate;
        });
      }
      if (reportEndDate != '') {
        files = files.filter((file) => file <= this.reportEndDate + '.json');
        anonFiles = anonFiles.filter(
          (file) => file <= this.reportEndDate + '.json'
        );
        thisdata = thisdata.filter((item) => {
          return item.fromDate <= this.reportEndDate;
        });
        this.allPkgData = this.allPkgData.filter((item) => {
          return item.fromDate <= this.reportEndDate;
        });
      }
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
      if (!this.overallFirst) {
        this.overallFirst = first;
      } else {
        this.overallFirst = this.getEarlierDate(this.overallFirst, first);
      }
      if (!this.overallLast) {
        this.overallLast = last;
      } else {
        this.overallLast = this.getLaterDate(this.overallLast, last);
      }
      this.summaries.push(this.summarize(pkg, thisdata, first, last));
    });
    this.summaries.push(
      this.summarize(
        'All',
        this.allPkgData,
        this.overallFirst,
        this.overallLast
      )
    );
  }
};
