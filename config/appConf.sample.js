module.exports = {
  nodePort: 9000, // could be any port; 9000 is the default for this app
  server: {
    // server variables only required if you using https calls to update your software checkouts
    name: 'server1.yourorg.edu', // REPLACE WITH server name
    key: '/path/to/your/ssl.key', // REPLACE WITH path to your server's SSL key
    cert: '/path/to/your/ssl.crt', // REPLACE WITH path to your server's SSL cert
  },
  emailConverter: {
    baseUrl: 'https://yourEmailConverterApi/?q=',
    endOfUrl: '', //any additional URL text to include after
    objectPropForReturnValue: 'data.uid', // response object property with the desired return value
    affixSuffixToReturn: true, // if converter returns only a userId and not an email, may need to be true
    suffix: '@miamioh.edu', // suffix to append to results of API if needed
  },
  software: [
    {
      provider: 'Adobe', // 'Adobe' is currently the only supported value, but that could change in the future
      name: 'Adobe Photoshop', // REPLACE WITH the LIbCal name for the product
      shortName: 'photoshop', // Short name for your own convenience
      adobeGroupName: 'MyLibrary Photoshop Patrons', // REPLACE WITH the Adobe User Mgmt User Group Name
    },
    {
      provider: 'Adobe', // 'Adobe' is currently the only supported value, but that could change in the future
      name: 'Adobe Illustrator', // REPLACE WITH the LIbCal name for the product
      shortName: 'illustrator',
      adobeGroupName: 'MyLibrary Illustrator Patrons', // REPLACE WITH the Adobe User Mgmt User Group Name
    },
  ],
};
