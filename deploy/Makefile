HERE = $(shell pwd)
ANSIBLE = $(VENV)/bin/ansible

.PHONY: all build clean

all: 
	echo "Please run make local or make vagrant"

virtualenv:
	virtualenv $(ANSIBLE)
	$(ANSIBLE)/bin/pip install ansible

vagrant: viirtualenv
	$(ANSIBLE)/bin/ansible --version
	vagrant up --no-provision
	vagrant provision
	$(ANSIBLE)/bin/ansible-playbook vagrant.yml --private-key=./files/vagrant.priv

local: virtualenv
	$(ANSIBLE)/bin/ansible --version
	$(ANSIBLE)/bin/ansible-playbook local.yml

clean-vagrant:
	vagrant destroy
	rm authorized_keys
