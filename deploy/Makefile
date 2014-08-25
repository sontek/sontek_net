HERE = $(shell pwd)
VENV = .venv

.PHONY: all build clean

all: 
	echo "Please run make local or make vagrant"

virtualenv:
	virtualenv $(VENV) --system-site-packages
	$(VENV)/bin/pip install ansible

vagrant: viirtualenv
	$(VENV)/bin/ansible --version
	vagrant up --no-provision
	vagrant provision
	$(VENV)/bin/ansible-playbook vagrant.yml --private-key=./files/vagrant.priv

local: virtualenv
	$(VENV)/bin/ansible --version
	$(VENV)/bin/ansible-playbook local.yml

clean-vagrant:
	vagrant destroy
	rm authorized_keys
