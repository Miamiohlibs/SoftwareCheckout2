# Changelog

## 2.4.1 - 2025-06-25

### Changed

- Eliminated bug in api that sometime prevented the "compare" function from working in the admin web console.
- Improved the "time waiting" display in the admin web console with a more human-readable output and more accurate wait time when reservation had been made in advance of it starting.
- Fixed bug that incorrectly displayed reservations as both waiting to start and waiting to be revoked in the admin web console when an aliased email was used to make the reservation.
- Updated dependencies to address security vulnerabilities.
- removed unused ./index.js file.

## 2.4.0 - 2024-10-30

### Added

- New feature: Web-based admin console, including System Status, Logs, and Stats. Uses Express.js and EJS. This is an optional feature not required to run the core license management scripts functionality, but should make it easier to monitor and troubleshoot the system. Setting up the admin console requires additional configuration steps, added as an "admin" property. See the [documentation](https://miamiohlib.gitbook.io/software-checkout/setup/admin-web-console) for details.

### Changed

- Updated logEachCheckout, getUsageData, and anonymizeStats to be cron-friendly (no longer requires the user to be in the same directory being evaluated).

## 2.3.0 - 2024-06-12

### Added

- New feature: "demo" scripts allow user to manually add, remove, and list license assignments in LibCal and Jamf on the command line. Also allows lookup of reservations in LibCal, and manage known email aliases.

### Changed

- Jamf uses bearer token for authentication instead of username and password.
- More consistent log format.
- Improved error handling for stats functions and emailConverter.
- Expanded documentation.

## 2.2.0 - 2023-08-15

### Changed

- Adobe API uses Oauth2 for authentication instead of deprecated JWT.
