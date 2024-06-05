# Jamf

## User didn't receive VPP email invitation

### Symptoms

* user never received VPP email invitation
* even though user is assigned to a license group, they still see a price tag instead of an "Install" link when they go to download the app from the Apple App Store.&#x20;

### Solution

In Jamf, an **administrator** can re-send the invitation (must have sufficient permissions to perform this action). To do so:&#x20;

1. In the Jamf Console, Select "Users" > "Invitations"
2. Locate the correct invitations group, e.g.:\
   `ULB software Checkout          62%        Miami VPP`
3. Click on the "Accepted" percentage (62% in the example above)
4. You'll have a list of users -- filter it to find the user in question
5. Click on the user invitation record (there may be more than one; you may have to look at more than one to complete the next step)
6. In the very lower-right hand corner of the interface, you'll see "History", "Redo", and "Delete" buttons. Click the "Redo" button to re-send the invitation.

