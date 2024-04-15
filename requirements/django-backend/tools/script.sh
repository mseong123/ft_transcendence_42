#!/bin/sh

echo "Migrate files"
python manage.py migrate

echo "Collect Static"
python manage.py collectstatic --no-input

if python manage.py shell -c "from django.contrib.auth.models import User; import sys;
sys.exit(not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists())"; then
	echo "Superuser already created"
else
	echo "Create superuser"
	python manage.py createsuperuser --no-input
	python manage.py shell -c "from allauth.account.models import EmailAddress;from django.contrib.auth.models import User;admin=User.objects.get(username='$DJANGO_SUPERUSER_USERNAME');EmailAddress.objects.create(email='$DJANGO_SUPERUSER_EMAIL', verified=True, primary=True, user=admin)"
fi

echo "Start daphne server"
daphne -e ssl:443:privateKey=../cert/key.pem:certKey=../cert/cert.pem core.asgi:application
