const {
  filterToEntriesMissingFromSecondArray,
} = require('./../../helpers/utils');

describe('Utils: filterToEntriesMissingFromSecondArray', () => {
  arr1 = ['one', 'two', 'three', 'four'];
  arr2 = ['one', 'two', 'three'];
  arr3 = ['one', 'four'];
  it('should return ["four"] as missing from arr1,arr2', () => {
    res = filterToEntriesMissingFromSecondArray(arr1, arr2);
    expect(res).toEqual(['four']);
  });
  it('should return ["two","three"] as missing from arr1,arr3', () => {
    res = filterToEntriesMissingFromSecondArray(arr1, arr3);
    expect(res).toEqual(['two', 'three']);
  });
});
