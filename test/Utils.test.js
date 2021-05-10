const Utils = require('../helpers/Utilities');
const u = new Utils();
testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('Utils: chunkArray', () => {
  it('it should chunkArray return 2 arrays when max=5', () => {
    res = u.chunkArray(testArray, 5);
    expect(res.length).toBe(2);
    expect(res[0].length).toBe(5);
  });
  it('it should chunkArray return 3 arrays when max=4', () => {
    res = u.chunkArray(testArray, 4);
    expect(res.length).toBe(3);
    expect(res[0].length).toBe(4);
  });
});

describe('Utils: filterToEntriesMissingFromSecondArray', () => {
  arr1 = ['one', 'two', 'three', 'four'];
  arr2 = ['one', 'two', 'three'];
  arr3 = ['one', 'four'];
  it('should return ["four"] as missing from arr1,arr2', () => {
    res = u.filterToEntriesMissingFromSecondArray(arr1, arr2);
    expect(res).toEqual(['four']);
  });
  it('should return ["two","three"] as missing from arr1,arr3', () => {
    res = u.filterToEntriesMissingFromSecondArray(arr1, arr3);
    expect(res).toEqual(['two', 'three']);
  });
});
