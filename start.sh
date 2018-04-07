#!/bin/bash

if [ $# -eq 3 ] && [ $2 -eq $2 ] && [ $3 -eq $3 ]; then
    # min inclusive
    # max exclusive
    # 0 indexed
    min=$2
    max=$3
    i=0

    while IFS='' read -r line || [[ -n "$line" ]]; do
        if [ $i -lt $max ] && [ $i -ge $min ]; then
            echo "Processing: $line"
            node class_info_scrape.js $line
            sleep 1
        fi
        ((i++))
    done < "$1"

else
    echo "Needs 3 arguments. file name. start index. end before index."
fi