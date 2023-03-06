let AdobeSavingsCalculator = require('./models/AdobeSavingsCalculator');
let calc = new AdobeSavingsCalculator();
calc.calculateSavings();
console.log('Monthly Savings:', calc.monthlySavings);
console.log('Total Savings: $', calc.totalSavings);
// console.log('Total Users: ', calc.users.length);
// console.log(
//   'User by savings',
//   calc.users
//     .sort((a, b) => b.savings - a.savings)
//     .map((item) => item.email + ':' + item.savings)
// );
