HERE = $(shell pwd)

.PHONY: all

all: 
	@echo Please run make dev or make prod

dev:
	docker-compose -f docker-compose.dev.yml up --build

prod:
	docker-compose -f docker-compose.prod.yml build
	docker-compose -f docker-compose.prod.yml push
	docker-compose -f docker-compose.prod.yml --context sontek_net pull
	docker-compose -f docker-compose.prod.yml --context sontek_net up -d

api_logs:
	docker exec -ti sontek_net_api_1 supervisorctl tail -f gunicorn

reload_nginx:
	docker-compose -f docker-compose.dev.yml restart nginx

