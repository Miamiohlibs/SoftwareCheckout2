# Current App Outline

- get Tokens
  - Adobe.getToken()
  - LibCal.getToken()
- Compare LibCal and Adobe
  - get Adobe software license group configs; foreach config
    - getCurrentBookings (Libcal) // returns { emails, bookings }
    - getCurrentEntitlements (Adobe) // returns emails array
    - getUIDsFromEmails(getCurrentBookings.emails)
    - getNewAndExpiredBookings // returns {newBookings, expiredBookings}
- Update Entitlements
  - foreach software license group config:
    - addNewEntitlements(newBookings)
    - revokeExpiredEntitlements
- Report Successes/Failures
