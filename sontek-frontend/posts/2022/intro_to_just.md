---
category: |
    development
date: 2022-02-26
tags: |
    linux
title: Automate project workflows with the command runner Just!
---

I believe every project should have a CLI built around the standard workflows of developing
on the project.  Things like:

- Install dependencies
- Run tests
- Run linter and formatters
- Build project
- Start / Stop the docker environment

The reason I think this is important is because it makes a nice consistent and discoverable
entrypoint for understanding how you should work in the project.   If you only provide the
instructions in the `README` then you have to remember to update those docs every time you
add a new command.  Those docs aren't easily testable either.

Most of my career the command runner of choice for my projects as been `GNU Make` but it was
definitely the wrong tool for the job.  It is a build tool that I bent into shape to work
as a command runner for me.   These days I use the tool [just](https://github.com/casey/just).

## Intro to just
[Just](https://github.com/casey/just) is a modern command runner with a similar syntax to `make`
that provides a nice way for building out your project CLI!  You create a file named `justfile`
at the root of your project and then the basic syntax is:

```make
help:
  @just --list

# My first command
first:
  echo "Any commands you want to run go here!"
```

The first `help` line defines a command "help" for your CLI and it lists out all the other available
commans.  I always put this line first because `just` runs the first command in the file if a specific
command isn't requested.  The output of this file looks like this:

```bash
❯ just
Available recipes:
    first # My first command
    help
```

Having help automatically generated is fantastic!  Its also really helpful that it adds the comment
to the command so that each command is self-documenting.  If you run the `first` command you'll notice
it also has a feature where it prints out the commands being ran so the user knows exactly what is
happening:

```bash
❯ just first
echo "Any commands you want to run go here!"
Any commands you want to run go here!
```

This doesn't always make sense though, so you can quickly remove that behavior by putting an `@` in front
of any of the commands, like I did for the `help` command above.  You can also declare dependencies if
you have re-usable parts of your workflow that many of your commands need.

For example, you might want to check versions of things like `node` and `python` before running the install
of their dependencies. So you could do something like:

```make
help:
  @just --list

node_version := "v17.6.0"

# Verify system dependencies
check-dependencies:
  @if [ ! "$(node --version)" = {{ node_version }} ]; \
  then \
    echo "Missing node version: {{ node_version }}"; \
    exit 1; \
  fi

# Install frontend
install: check-dependencies
  @echo "yarn install"
```

which ends up with a CLI that looks like this:

```bash
❯ just
Available recipes:
    check-dependencies # Verify system dependencies
    help
    install            # Install frontend

❯ just install
Missing node version: v17.6.0
error: Recipe `check-dependencies` failed on line 12 with exit code 1
```

This opens up a lot of possibilities! In the above `justfile` you'll notice I'm using a multi-line
command but I have `\` at the end of each line.  This is because `just` by default is going to run
each new line in their own shell.   So this just makes all those lines run in the same shell.

You do not have to use this syntax though.  Just is `polyglot` and can run commands from any language
you would like.

### Polyglot
If you want to use a bash script as one of your commands, you can do so by adding a shebang at the top:

```make
check-dependencies:
  #!/usr/bin/env bash
  set -euxo pipefail
  if [ ! "$(node --version)" = {{ node_version }} ];
  then
    echo "Missing node version: {{ node_version }}"
    exit 1
  fi
```

Now the entire command is using a bash script to execute! This gets really interesting if you want to start
using things like python, so if you'd like to change the dependency checker above to python:

```python
check-dependencies:
  #!/usr/bin/env python3
  import subprocess
  result = subprocess.run(
    ['node', '--version'],
    stdout=subprocess.PIPE
  )
  if result != "{{ node_version }}":
    print(f"Missing node version: {{ node_version }}")
    exit(1)
```

You can even tell `just` that you want to use a specific language for all commands!

```
set shell := ["python3", "-c"]
```

This not only affects the commands you have in your recipe but also anything inside
backticks!  So something like:

 ```make
 `print("Rust is the best programming language")`
 ```

It would run through python instead of the shell.

### Enviornment Files
One of the other modern things `just` adds to your workflow is the ability to utilize dotenv
files.  So for example if you want to define which port you launch your http server on, you can
create a file called `.env`:

```bash
WEBSERVER_PORT=9000
```

and then utilize it in your `justfile`:

```make
set dotenv-load

http:
  @echo "Starting webserver in current directory"
  python3 -m http.server $WEBSERVER_PORT
```

When you run `just http` it'll launch the http server on port 9000.  One important line
in this file is `set dotenv-load`, it will not load the `.env` file without you telling it to.


## Don't use language specific scripts!
I'n not a fan of language specific command runners like `package.json` in the node community.

It always frustrates me when I start working on a project that heavily uses `scripts` in their
package.json instead of using a real command runner. `json` is not a great format for writing
discoverable CLI commands. For example if you wanted to write a `next.js` build script:

```json
    "scripts": {
        "predeploy": "yarn build && yarn export && touch dist/.nojekyll && echo sontek.net > dist/CNAME",
        "deploy": "gh-pages -d dist -t true",
        "build": "next build",
        "export": "next export -o dist/",
    },
```

Combining all those commands is really messy and not easily understandable through `yarn run`:

```bash
❯ yarn run
yarn run v1.22.17
info Commands available from binary scripts: autoprefixer, browserslist, css-blank-pseudo, css-has-pseudo, css-prefers-color-scheme, cssesc, esparse, esvalidate, extract-zip, gh-pages, gh-pages-clean, js-yaml, loose-envify, nanoid, next, prettier, resolve, rimraf, semver, svgo, uvu
info Project commands
   - build
      next build
   - deploy
      gh-pages -d dist -t true
   - export
      next export -o dist/
   - predeploy
      yarn build && yarn export && touch dist/.nojekyll && echo sontek.net > dist/CNAME
```

I'd much rather have this:

```
❯ just
Available recipes:
    build       # Build frontend assets
    deploy      # Deploy assets to cloudfront
    export      # Export to static assets (no SSR)
```

## Conclusion
[Just](https://github.com/casey/just) is a wonderful tool for building project specific CLIs without much effort. It is
a great replacement for `Make` if you are using it as a command runner and it has most of the features you'd need.

I recommend adding a `justfile` to your projects today!   I use one to even maintain my [home directory](https://github.com/sontek/homies/blob/master/justfile)!