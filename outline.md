# Current App Outline

- get Tokens
  - Adobe.getToken()
  - LibCal.getToken()
- use cron or scheduler to do every 15 minutes
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

---

## Proposed file structure

- certs/
  - SSL certificates, gitignored
- classes/
  - MiamiEmail
  - Throttle
  - Utils
- config/
  - appConf
    - defines which services are turned on
  - adobeConf
  - libCalConf
  - appleConf
    - these individual service confs should include: API keys, endpoints to be called by services, some defaults (baseurl, port, etc + opportunity to override for specific calls if necessary)
- logs/
  - possibly a separate log per day, and a cleanup mechanism after a month
  - timestamp each line?
- models/
  - AdobeApi
  - AppleApi
  - LibCalApi
- services/
  - Adobe (talks to AdobeRepo && LibCalRepo)
  - Apple (talks to AppleRepo && LibCalRepo)
  - getUniqidFromEmail (checks cache, db, or performs query)
- repositories/
  - AdobeRepo
  - AppleRepo
  - LibCalRepo
- test/
  - [tests for each class]
