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

// genList generates a list of choices for the inquirer prompt
// (inquirer is a library for prompting the user for input)
const genList = ({
  list, // array of objects
  message, // prompt text
  itemNameProp, // object prop with name of the item to be displayed
  itemValueProp, // object prop with value of the item to be returned
  outputLabel, // name of the output variable
}) => {
  const choices = list.map((item, index) => {
    // let value = index; // return index as default
    // if (item.hasOwnProperty(itemNameProp)) {
    //   value = item[itemNameProp]; // or return the value of the itemNameProp
    // }
    return {
      key: index,
      name: item[itemNameProp],
      value: item[itemValueProp],
    };
  });
  return {
    type: 'rawlist',
    message: message,
    name: outputLabel,
    choices: choices,
  };
};

module.exports = {
  sleep,
  filterToEntriesMissingFromSecondArray,
  asyncForEach,
  axiosLogPrep,
  genList,
};
