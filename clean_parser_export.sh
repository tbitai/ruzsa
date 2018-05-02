#!/usr/bin/env bash

FILE="js/lib/tarskiFOL.js"
REGEXP="typeof exports"

# Check if export part is in the expected format
if [ `grep -c "$REGEXP" $FILE` == 0 ]; then
    echo "ERROR! Couldn't find export part in parser file." 1>&2
    exit 1
fi

# Delete export part
sed -i -e "/$REGEXP/,\$d" $FILE

# Add new export part
printf "exports.parser = tarskiFOL;\n" >> $FILE
