let AdobeSavingsCalculator = require('./models/AdobeSavingsCalculator');
let calc = new AdobeSavingsCalculator();
calc.calculateSavings();
let firstMonth = calc.monthlySavings[0].month;
let lastMonth = calc.monthlySavings[calc.monthlySavings.length - 1].month;

let output = {
  conf: calc.conf,
  firstMonth: firstMonth,
  lastMonth: lastMonth,
  users: calc.users.length,
  monthlySavings: calc.monthlySavings,
  totalSavings: calc.totalSavings,
};
console.log(JSON.stringify(output, null, 2));
// console.log('Total Users: ', calc.users.length);
// console.log(
//   'User by savings',
//   calc.users
//     .sort((a, b) => b.savings - a.savings)
//     .map((item) => item.email + ':' + item.savings)
// );
