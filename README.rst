Code for managing sontek.net
============================

Syntax Highlighting
-------------------
For dark we I'm using a customized monakai that meets accessibility
standards. For light mode I'm using solarized_light.

Can get the pygments CSS by running:

.. sourcecode:: bash

   docker run --rm -ti sontek/api:dev pygmentize -S solarized-light -f html -a .highlight > solarized_light.css
