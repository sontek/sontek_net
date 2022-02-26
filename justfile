help:
  @just --list

fe := "sontek-frontend"

# Run command in the frontend directory
cfe CMD:
  cd {{ fe }} && {{ CMD }}

# Install all frontend dependencies
install-fe:
  just cfe "yarn"

# Run frontend dev server
dev-fe: install-fe
  just cfe "yarn dev"


# Build and deploy assets
deploy-prod:
  just cfe "yarn build"
  just cfe "yarn export"
  touch {{ fe }}/dist/.nojekyll
  echo "sontek.net" > {{ fe }}/dist/CNAME
  just cfe "yarn deploy"
