#!/usr/bin/bash

cd dist

# Remove files
rm js/bundle.js.map stylesheets/bundle.css.map

# Remove links
for FILE in "js/bundle.js" "stylesheets/bundle.css"; do
	sed -i -e '/\/[/*]# sourceMappingURL=/d' $FILE
done

