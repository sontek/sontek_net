help:
  @just --list

fe := "sontek-frontend"

# Run command in the frontend directory
_cfe CMD:
  cd {{ fe }} && {{ CMD }}

# Install all frontend dependencies
fe-install:
  just _cfe "yarn"

# Run frontend dev server
fe-dev: fe-install
  just _cfe "yarn dev"

# Run linting for frontend
fe-lint: fe-install
  just _cfe "yarn lint"

# Run linting for frontend
lint: fe-lint
  echo "Done linting"


# Build and deploy assets
fe-deploy-prod:
  just _cfe "yarn build"
  just _cfe "yarn export"
  touch {{ fe }}/dist/.nojekyll
  echo "sontek.net" > {{ fe }}/dist/CNAME
  just _cfe "yarn deploy"
