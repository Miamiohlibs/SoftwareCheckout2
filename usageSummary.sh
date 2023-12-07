#!/usr/bin/env bash

START_YEAR=2020
END_YEAR="$(date +%Y)"

for directory in ./logs/dailyStats/*; do
    echo "Directory: $directory"
    for ((i=$START_YEAR; i<=$END_YEAR; i++)) 
    do
        # if [ ! -f "$directory/anon/$i"* ] ; then
        # if 
        #     continue
        # fi

        if compgen -G "$directory/anon/$i*" > /dev/null ; then
        echo "Year: $i"
        bookings=`jq '.[] | select(.status == "Confirmed") | {bookId} ' $directory/anon/$i* | grep bookId | sort | uniq | wc -l`
        users=`jq '.[] | select(.status == "Confirmed") | {email} ' $directory/anon/$i* | grep email | sort | uniq | wc -l`
        echo "  Bookings:$bookings"
        echo "  Users:$users"
        fi


        # echo "Year: $i"
        # bookings=`jq '.[] | select(.status == "Confirmed") | {bookId} ' $directory/anon/$i* | grep bookId | sort | uniq | wc -l`
        # users=`jq '.[] | select(.status == "Confirmed") | {email} ' $directory/anon/$i* | grep email | sort | uniq | wc -l`
        # echo "  Bookings:$bookings"
        # echo "  Users:$users"
    done
done
