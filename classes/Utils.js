module.exports = class Utils {
  chunkArray(arr, len) {
    const chunkedArr = [];

    // Loop through arr
    arr.forEach((val) => {
      // Get last element
      const last = chunkedArr[chunkedArr.length - 1];

      // Check if last and if last length is equal to the chunk len
      if (!last || last.length === len) {
        chunkedArr.push([val]);
      } else {
        last.push(val);
      }
    });
    return chunkedArr;
  }

  async asyncForEach(array, callback) {
    // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    // by: Sebastien Chopin
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  filterToEntriesMissingFromSecondArray(arr1, arr2) {
    return arr1.filter((i) => !arr2.includes(i));
  }
};
