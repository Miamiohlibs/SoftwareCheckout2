# LibCal

#### LibCal Setup

1. In LibCal's Equipment Checkout service, create a "Location" for software checkout and make note of the Location ID.
2. Create a separate "Location" for each different type of licensed software (e.g. Photoshop, Illustrator, InDesign, full Creative Cloud Suite)
3. Users will be able to checkout software at: https://youraccount.libcal.com/admin/equipment



* `config/libCal.js`: includes API key, config for requesting an API token, and query config for making API requests with the token.
  * update the softwareLocation with the Location ID you created for Software Checkout in LibCal
  * update the `client` values with the client ID and client\_secret API keys you get from LibCal
  * in the `auth` and `queryConfig` objects, enter the name of your libcal server (e.g. `miamioh.libcal.edu`) - include the `https://` only where indicated in the sample file
