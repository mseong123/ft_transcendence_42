# Pull base image
FROM python:3.11.8-slim-bullseye

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# COPY django app Set work directory
COPY ./data/django /website
WORKDIR /website

# Install dependencies
# COPY ./requirements.txt .
RUN pip install -r requirements-prune.txt

#RUN server
EXPOSE 443
EXPOSE 8000
# CMD ["python", "manage.py", "runserver","0.0.0.0:8000"]
# CMD ["daphne", "-e", "ssl:443:privateKey=../cert/key.pem:certKey=../cert/cert.pem", "core.asgi:application"]
# daphne -e ssl:443:privateKey=./certificate/key.pem:certKey=./certificate/cert.pem core.asgi:application

COPY ./tools/script.sh /
RUN chmod +x /script.sh

ENTRYPOINT ["../script.sh"]