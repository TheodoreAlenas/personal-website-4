#!/bin/bash

state=ROOT

# sed "6q;d" *.md | cut -d ' ' -f 1

while true
do
	clear
	echo -e "`awk '
		{ 
			printf $1;
			printf "\\\\033[0;34m";
			printf " %-16s", $2;
			printf "\\\\033[0m";
			i += 18;
			if (i >= '$COLUMNS'-19) {
				print "";
				i = 0;
			}
		}
		' hk-states/$state`"
	read -n 1 -s -r
 	next=$( awk "/^$REPLY/ { print \$2 }" hk-states/$state )
 
 	if [ -z $next ]
 	then
 		next=ROOT
 		bspc node last --focus
 	fi
 
	hasdot=`echo $next | grep [.]` 
	if [ -n "$hasdot" ]
 	then
		awkarg="/^$REPLY/ { for (i=3; i<NF; i++) printf \$i \" \"; print \$NF }"
		bspc node last --focus
		eval `awk "$awkarg" hk-states/$state`
 		next=ROOT
 	fi

 	state=$next
done
