---
category: Development
date: 2022-02-18
tags:
    - Python
    - NodeJS
    - GoLang
    - Linux
title: Use asdf to manage Python, NodeJS, GoLang and more!
---

[asdf](https://asdf-vm.com/) is a general purpose version manager that
can manage versions of most programming language runtimes through a set
of plugins.

With micro-services being all the rage and the ever changing landscape
of the development world, it is rare to utilize a single version of
language runtime. Even when you want to upgrade from one to the other
you'll need both usable on your system at the same time.

I've used tools like `pyenv` and `nvm` in the past when I needed to change
versions depending on which project I'm contributing to. But with `asdf`
you have one tool to rule them all!


## Getting Started

The first thing you need to do when working with `asdf` is grab the
plugins for the languages you are interested in working with. You can list
what plugins are available:

```bash
> asdf plugin list all
golang                       *https://github.com/kennyp/asdf-golang.git
golangci-lint                 https://github.com/hypnoglow/asdf-golangci-lint.git
nodejs                       *https://github.com/asdf-vm/asdf-nodejs.git
poetry                       *https://github.com/asdf-community/asdf-poetry.git
python                       *https://github.com/danhper/asdf-python.git
yarn                         *https://github.com/twuni/asdf-yarn.git
```

On the left will be the name of the plugin and on the right will be the repository
where it lives.  It'll me marked with an asterisk if you already have it installed.

To install a plugin you say `asdf plugin add <plugin>` to get it installed.  You can
also provide the repository where you want it pulled from, for example:

```bash
> asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
> asdf plugin add python https://github.com/danhper/asdf-python.git
```

This will not give you any version of those languages, it is only installing the
plugin that knows how to work with those languages.   You are ready to pull down
any versions you want at that point:

```bash
> asdf install nodejs 14.19.0
> asdf install python 3.9.10
```

Once you have the versions installed you will be able to view them like this:

```bash
> asdf list
golang
  1.17.7
nodejs
  --help
  12.22.10
  14.19.0
  16.14.0
  17.5.0
poetry
  1.1.13
python
  3.9.10
yarn
  1.22.17
```

## Using the installed languages
To activate a specific version of a language you have you have three options:

### Make it global
You can make it global, meaning when you run the tool like `python` it'll use
this version for the system:

```bash
> asdf global python 3.9.10
```

### Make it local
You can make it local, which means it will generate a file in the current
directory named `.tool-versions` and so whenever you change into a directory
it will activate the versions defined in there.

```bash
> asdf local nodejs 12.22.10
> cat .tool-versions 
nodejs 12.22.10
```

The great thing about this is you can commit that file to git and then anyone
who checks out the project and uses `asdf` will have the same versions activated!

### Temporary
If you want to activate a version of a language temporarily you can swap to it
for the current shell:

```bash
> asdf shell golang 1.17.7
> env|grep -i ASDF
ASDF_GOLANG_VERSION=1.17.7
```

It sets an environment variable that will have preference over the file. If you
ever wonder what versions a directory is using you can run:

```bash
> asdf current
golang          ______          No version set. Run "asdf <global|shell|local> golang <version>"
nodejs          12.22.10        .tool-versions
poetry          ______          No version set. Run "asdf <global|shell|local> poetry <version>"
python          3.9.10          .tool-versions
yarn            1.22.17         .tool-versions
```


## Conclusion
[asdf](https://asdf-vm.com/)  is an AWESOME tool to utilize if you find yourself using many
different languages or many different versions of the same language. You should check it out
and see if it can improve your workflow.

I made a video of me using the tool here:

<iframe width="854" height="480" src="https://www.youtube.com/embed/RTaqWRj-6Lg"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
></iframe>
