---
category: linux
date: 2022-02-18
tags:
    - linux
title: Using Nix as your local package manager
---

You should be using Nix as your loca package manager!  Nix is cross-platform and allows you to
create reproducible environments.

Tools like `homebrew` and `apt` modify configuration system wide and there isn't a great way to
rollback an update that went wrong.

Nix is all kinds of things, it is a configuration language, package manager, and an operating system
but I'm only talking about using as a package manager.

So why would you use Nix over homebrew or apt?

- It installs the packages in an isolated environment and then symlinks them in. Which means it is
non-destructive and you can easily revert and installs or upgrades you attempted.

- It keeps a log of the modifications you’ve made and you can rollback to any version.

- Cross-platform so you can have the same environment on Linux and OSX.

The other great thing about Nix is there is a difference between packages installed because you
wanted them and ones that were installed as a dependency.   This allows you to quickly look at
which packages you've personally pulled in:


