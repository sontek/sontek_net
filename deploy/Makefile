HERE = $(shell pwd)
ANSIBLE = $(VENV)/bin/ansible

.PHONY: all build clean auth_keys

all: build

clean:
	vagrant destroy
	rm authorized_keys

auth_keys:
	cat ~/.ssh/id_rsa.pub > $(HERE)/authorized_keys
	cat files/vagrant.pub >> $(HERE)/authorized_keys

build: auth_keys ansible
	( \
	ansible --version ;\
	vagrant up ;\
	vagrant provision ;\
)

ansible:
	( \
	ARCHFLAGS="-Wno-error=unused-command-line-argument-hard-error-in-future" pip install ansible ;\
	ansible --version ;\
)
