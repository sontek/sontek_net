sontek README

To generate resume PDF:

weasyprint <url> -s <(echo '#posts { margin: 0 !important; padding-left: 0 !important; border-left: 0 !important; }') resume.pdf
