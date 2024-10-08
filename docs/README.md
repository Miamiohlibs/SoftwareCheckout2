# Overview

**Software Checkout** is a Node.js app for libraries and other institutions to allow dynamic request and assignment of software licenses. Users can request license access by signing up for a time-slot using SpringShare's [LibCal](https://www.springshare.com/libcal/); the app then updates license assignments with the vendor's user management API to assign or a revoke licenses at the appropriate time.

The main Software Checkout app does not have its own web interface, but there is an admin web console to provide an easy way for admins to check on the status of license assignments, usage statistics, and examination of system logs.

## Current Supported Vendors

* [Adobe Creative Cloud](https://www.adobe.com/creativecloud.html)
* [Jamf](https://www.jamf.com/) (manages MacOS and iOS software)

## Requirements

* [Node.js ](https://nodejs.org/en/about)18
* LibCal subscription

## GitHub Repo

[https://github.com/Miamiohlibs/SoftwareCheckout2](https://github.com/Miamiohlibs/SoftwareCheckout2)

## Credits

Developed by Ken Irwin at Miami University, in cooperation with Michael Bomholt.
