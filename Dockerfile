# production environment
FROM 	nginx
COPY	./build /usr/share/nginx/html
RUN 	rm /etc/nginx/conf.d/default.conf
COPY 	deploy/nginx.conf /etc/nginx/conf.d
EXPOSE 	80
CMD 	["nginx", "-g", "daemon off;" ]