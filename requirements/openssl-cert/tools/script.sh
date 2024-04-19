#!/bin/sh

if [ ! -f "/cert/cert.pem" ]; then
	echo "Generating certificate"
    openssl req -x509 -newkey rsa:4096 -keyout /cert/key.pem -out /cert/cert.pem -days 365 -nodes -subj "/C=Ms/L=KL/O=42kl/OU=student/CN=jyim.42.kl"
fi

if openssl x509 -checkend 86400 -noout -in /cert/cert.pem
then
	echo "Certificate still valid for >24 hours"
else
	echo "Re-generating certificate"
	openssl req -x509 -newkey rsa:4096 -keyout /cert/key.pem -out /cert/cert.pem -days 365 -nodes -subj "/C=Ms/L=KL/O=42kl/OU=student/CN=jyim.42.kl"
fi