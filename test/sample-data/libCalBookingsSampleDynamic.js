
const moment = require('moment');
const yesterday = (moment().subtract(1, 'days').format() ); 
const nextWeek = (moment().add(6, 'days').format() ); 
const nextWeekStart = (moment().add(7, 'days').format() );
const nextWeekEnd = (moment().add(14, 'days').format() );

module.exports = [
          {
              "bookId": "csldxgLie",
              "eid": 60982,
              "cid": 15705,
              "lid": 8370,
              "fromDate": "2019-03-05T00:00:00-05:00", // too old
              "toDate": "2019-03-12T00:00:00-04:00",
              "firstName": "Ken",
              "lastName": "Irwin",
              "email": "irwinkr@miamioh.edu",
              "status": "Confirmed"
          },
          {
              "bookId": "cs2AZJqs0",
              "eid": 61525,
              "cid": 15705,
              "lid": 8370,
              "fromDate": yesterday, // now but cancelled
              "toDate": nextWeek,
              "firstName": "Jerry",
              "lastName": "Yarnetsky",
              "email": "jerry.yarnetsky@miamioh.edu",
              "status": "Cancelled by User"
          },
          {
              "bookId": "csLVDpYHB",
              "eid": 60957,
              "cid": 15809,
              "lid": 8370,
              "fromDate": yesterday, // current and confirmed
              "toDate": nextWeek,
              "firstName": "Ken",
              "lastName": "Irwin",
              "email": "irwinkr@miamioh.edu",
              "status": "Confirmed"
          },
          {
              "bookId": "csam4KmCA",
              "eid": 61239,
              "cid": 15866,
              "lid": 8370,
              "fromDate": nextWeekStart, // too far future
              "toDate": nextWeekEnd,
              "firstName": "Meng",
              "lastName": "Qu",
              "email": "qum@miamioh.edu",
              "status": "Cancelled by User"
          }
];