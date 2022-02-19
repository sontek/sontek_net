---
category: |
    programming
date: 2022-02-18
tags: |
    python,nodejs,golang,linux
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

![image](/images/posts/one_to_rule_them_all.png)

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
To activate a specific version of a language you have 