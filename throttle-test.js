const Throttle = require('./classes/Throttle.js');
const throttle = new Throttle(5, 10);

function Log(phrase) {
  console.log(phrase);
}

(async () => {
  for (let i = 0; i < 10; i++) {
    await throttle.pauseIfNeeded();
    Log('next:' + i);
    throttle.increment();
  }
})();
