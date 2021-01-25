#!/bin/bash

find blog_posts/ -name "*.rst" -exec sed -i -e 's/.. author:: default//g' {} \;
find blog_posts/ -name "*.rst" -exec sed -i -e 's/.. categories::/:category:/g' {} \;
find blog_posts/ -name "*.rst" -exec sed -i -e 's/.. tags::/:tags:/g' {} \;
find blog_posts/ -name "*.rst" -exec sed -i -e 's/.. comments:://g' {} \;
find blog_posts/ -name "*.rst" -exec sed -i -e '$a\' {} \;

