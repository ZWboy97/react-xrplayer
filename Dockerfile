# build environment
FROM 	node as build
WORKDIR	/app
ENV	    PATH /app/node_modules/.bin:$PATH
COPY 	. /app
RUN	    yarn
RUN 	yarn build

# production environment
FROM 	nginx
COPY	--from=build /app/build /usr/share/nginx/html
RUN 	rm /etc/nginx/conf.d/default.conf
COPY 	deploy/nginx.conf /etc/nginx/conf.d
EXPOSE 	80
CMD 	["nginx", "-g", "daemon off;" ]