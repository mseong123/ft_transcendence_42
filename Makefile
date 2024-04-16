all:
		@if [ -d "./data/django" ]; then \
			echo "django Directory exist"; \
		else \
			echo "Create django Directory"; \
			mkdir -p "./data/django"; \
		fi

		@if [ -d "./data/cert" ]; then \
			echo "cert Directory exist"; \
		else \
			echo "Create cert Directory"; \
			mkdir -p "./data/cert"; \
		fi

		docker-compose -f ./docker-compose.yml up -d --build

up:
		docker-compose -f ./docker-compose.yml up -d --no-recreate

down:
		docker-compose -f ./docker-compose.yml down

re:
		docker-compose -f ./docker-compose.yml up -d --build

clean:
		@docker stop $$(docker ps -qa);\
		docker rm $$(docker ps -qa);\
		docker rmi -f $$(docker images -qa);\
		docker volume rm $$(docker volume ls -q);\
		docker network rm $$(docker network ls -q) 2>/dev/null;\
		rm -rf ./data/django;\

.PHONY: all re down clean