#!/bin/bash

# run getTokens.sh first, then use the token provided as an argument to this script 

p='adobecc'
#p='photoshop' 
curl -X GET \
  https://community.miamioh.edu/directory-accounts/api/members/dulb-patron$p\
  -H 'Accept: application/json' \
  -H "Authorization: $1"

