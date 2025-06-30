# Software Checkout

**Software Checkout** is a Node.js app for libraries and other institutions to allow dynamic request and assignment of software licenses. Users can request license access by signing up for a time-slot using SpringShare's [LibCal](https://www.springshare.com/libcal/); the app then updates license assignments with the vendor's user management API to assign or a revoke licenses at the appropriate time.

The main Software Checkout app does not have its own web interface, but there is an admin web console to provide an easy way for admins to check on the status of license assignments, usage statistics, and examination of system logs.

Learn more about this project in our open-source journal article:

- Irwin, K., & Bomholt, M. (2024). On-Demand Circulation of Software Licenses: Checking Out Software on Patrons’ Own Devices. Information Technology and Libraries, 43(2). [https://doi.org/10.5860/ital.v43i2.16977](https://doi.org/10.5860/ital.v43i2.16977)The main Software Checkout app does not have its own web interface, but there is an admin web console to provide an easy way for admins to check on the status of license assignments, usage statistics, and examination of system logs.

## Current Supported Vendors

- [Adobe Creative Cloud](https://www.adobe.com/creativecloud.html)
- [Jamf](https://www.jamf.com/) (manages MacOS and iOS software)

## Requirements

- [Node.js ](https://nodejs.org/en/about)24
- LibCal subscription

## Documentation

- [Software Checkout documentation site](https://miamiohlib.gitbook.io/software-checkout/)
- [Software Checkout license](https://github.com/Miamiohlibs/SoftwareCheckout2/blob/main/LICENSE)

## Credits

Developed by [Ken Irwin](irwinkr@miamioh.edu) at Miami University, in cooperation with Michael Bomholt.
