help:
  @just --list

fe := "sontek-frontend"

# Run command in the frontend directory
cfe CMD:
  cd {{ fe }} && {{ CMD }}

# Install all frontend dependencies
install-frontend:
  just cfe "yarn"

# Run frontend dev server
dev-frontend: install-frontend
  just cfe "yarn dev"


# Build and deploya assets
deploy-prod:
  just cfe "yarn build"
  just cfe "yarn export"
  touch {{ fe }}/dist/.nojekyll
  echo "sontek.net" > {{ fe }}/dist/CNAME
  just cfe "yarn deploy"
