#!/usr/bin/env bash

# relies on "tac" -- you must have coreutils installed for this to work
# on a mac, do "brew install coreutils"
tac logs/app.log  | awk '!flag; /Starting update at/{flag = 1};' | tac

# This way didn't work well after a while
#START=`grep -n 'Starting update at' logs/app.log | tail -n1 | cut -d':' -f1`
# echo $START;
#LEN=`wc -l logs/app.log | awk '{print $1}'`
# echo $LEN;
#OFFSET=2;
#DIFF=`expr $LEN - $START + $OFFSET`
# echo $DIFF
#tail -n$DIFF logs/app.log
