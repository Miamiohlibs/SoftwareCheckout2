#!/usr/bin/env bash

# for each directory in ./logs/dailyStats
#   for each year in the directory
#       if there are files for that year
#           count the number of bookings and distinct users from anonymised files

START_YEAR=2020
END_YEAR="$(date +%Y)"

for directory in ./logs/dailyStats/*; do
    echo ""
    echo "------------------------------------"
    sed -r "s/^.*\/(.*)$/\1/" <<< $directory
    echo "------------------------------------"
    for ((i=$START_YEAR; i<=$END_YEAR; i++)) 
    do
        if compgen -G "$directory/anon/$i*" > /dev/null ; then
        echo "Year: $i"
        bookings=`jq '.[] | select(.status == "Confirmed") | {bookId} ' $directory/anon/$i* | grep bookId | sort | uniq | wc -l`
        users=`jq '.[] | select(.status == "Confirmed") | {email} ' $directory/anon/$i* | grep email | sort | uniq | wc -l`
        echo "  Bookings: $bookings"
        echo "  Users: $users"
        fi
    done
done
