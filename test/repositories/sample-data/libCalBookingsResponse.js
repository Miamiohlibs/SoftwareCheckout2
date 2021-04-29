/*
This outputs a simulated LibCal bookings response with 4 records
- 2 records are for current reservations
- 1 record is for a past reservation that has ended
- 1 record is for a future booking
*/

const dayjs = require('dayjs');
// format: '2021-04-15T00:00:00-04:00
let dateFmt = 'YYYY-MM-DD' + 'T' + 'HH:mm:ss' + '-04:00';
let lastWeek = dayjs().subtract(7, 'day').format(dateFmt);
let lastMonth = dayjs().subtract(30, 'day').format(dateFmt);
let nextWeek = dayjs().add(7, 'day').format(dateFmt);
let nextMonth = dayjs().add(30, 'day').format(dateFmt);

arr = [
  {
    hint: 'should be included as current & confirmed',
    bookId: 'csDBYZVCM',
    eid: 61240,
    cid: 12345,
    lid: 1111,
    fromDate: lastWeek,
    toDate: nextWeek,
    created: lastWeek,
    firstName: 'Jeremy',
    lastName: 'User',
    email: 'jeruser@miamioh.edu',
    status: 'Confirmed',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
  {
    hint: 'should be included as current, excluded as cancelled',
    bookId: 'csDBYZVCM',
    eid: 71240,
    cid: 12345,
    lid: 1111,
    fromDate: lastWeek,
    toDate: nextWeek,
    created: lastWeek,
    firstName: 'Jeremy',
    lastName: 'User',
    email: 'jeruser@miamioh.edu',
    status: 'Cancelled',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
  {
    hint: 'should be included as current & confirmed',
    bookId: 'csmLm4Zfj',
    eid: 75562,
    cid: 12345,
    lid: 1111,
    fromDate: lastMonth,
    toDate: nextMonth,
    created: lastMonth,
    firstName: 'Evan',
    lastName: 'User',
    email: 'evanuser@miamioh.edu',
    status: 'Mediated Approved',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
  {
    hint: 'should be excluded: it is NOT current (past), but confirmed',
    bookId: 'cs1V7wxCK',
    eid: 75853,
    cid: 12345,
    lid: 1111,
    fromDate: lastMonth,
    toDate: lastWeek,
    created: lastMonth,
    firstName: 'Dominic',
    lastName: 'User',
    email: 'domuser@miamioh.edu',
    status: 'Confirmed',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
  {
    hint: 'should be excluded: it is NOT current (past), and cancelled',
    bookId: 'cs1V7wxCK',
    eid: 85853,
    cid: 12345,
    lid: 1111,
    fromDate: lastMonth,
    toDate: lastWeek,
    created: lastMonth,
    firstName: 'Dominic',
    lastName: 'User',
    email: 'domuser@miamioh.edu',
    status: 'Cancelled',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
  {
    hint: 'should be excluded: it is NOT current (future), but status is ok',
    bookId: 'cs1V7jZSK',
    eid: 75542,
    cid: 12345,
    lid: 1111,
    fromDate: nextWeek,
    toDate: nextMonth,
    created: lastWeek,
    firstName: 'Seth',
    lastName: 'User',
    email: 'sethuser@miamioh.edu',
    status: 'Mediated Approved',
    location_name: 'Library Software',
    category_name: 'Adobe Creative Cloud',
    item_name: 'Adobe Creative Cloud',
  },
];
module.exports = arr;
