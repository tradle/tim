FROM kyma/docker-nginx
ADD ./version.json .
ADD ./web/dist /var/www
ADD ./run.sh /tmp/
CMD ["/tmp/run.sh"]
