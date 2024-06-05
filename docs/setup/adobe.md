# Adobe

Adobe account with access to the User Management API

* Adobe user management API documentation: https://adobe-apiplatform.github.io/umapi-documentation/en/
* Adobe Admin Console: https://adminconsole.adobe.com/overview
* Console Documentation: https://helpx.adobe.com/enterprise/managing/user-guide.html

#### Adobe Setup

1. Using the [Adobe I/O Console](https://console.adobe.io/), create a new Project with an associated oAuth Server-to-Server credential.
2. Copy `config/adobe.sample.js` to `config/adobe.js` and add the Project details to that file (clientId, clientSecret,orgId)

#### Adobe Config

* `config/adobe.js`: includes API credentials, route to private key, and query config
  * the API credential are supplied when you request and API key from Adobe
  * as part of the API setup, you will create a public and private key pair; upload the public key to Adobe and store the private key in the `certs/` folder as `private.key`
  * the `queryConfig` does not need to be altered from `config/adobe.sample.js`
