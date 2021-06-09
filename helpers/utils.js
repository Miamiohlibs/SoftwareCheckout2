const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const filterToEntriesMissingFromSecondArray = (arr1, arr2) => {
  return arr1.filter((i) => !arr2.includes(i));
};

const asyncForEach = async (array, callback) => {
  // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
  // by: Sebastien Chopin
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const axiosLogPrep = (obj) => {
  if (obj !== undefined && obj.hasOwnProperty('request')) {
    delete obj.request;
  }
  return obj;
};

module.exports = {
  sleep,
  filterToEntriesMissingFromSecondArray,
  asyncForEach,
  axiosLogPrep,
};
