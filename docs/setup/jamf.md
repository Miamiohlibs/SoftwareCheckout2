# Jamf

#### Jamf

Jamf is a mobile device management system that can also manage software licenses. This app uses the [Jamf Classic API](https://developer.jamf.com/jamf-pro/docs/getting-started-2) to add and remove users from license groups for Apple software packages.

#### Jamf Setup

1. Create a Jamf user and grant it access to api integrations.
2. Create a static user group for each software title you wish to check out.
3. Create a Content Management invitation scoped to each static software group.
4. Create a Volume Assignment for each title scoped to the corresponding static user group.
