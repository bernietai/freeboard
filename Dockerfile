FROM node:6

RUN mkdir -p /usr/share/nginx/html

COPY . /usr/share/nginx/html/

RUN chown -R node:node /usr/share/nginx/html

WORKDIR /usr/share/nginx/html

RUN npm install; \
    npm install grunt-cli underscore

# browserify
RUN npm install base-64; \
	npm install jquery; 
RUN npm install -g browserify; 
RUN browserify -r jquery -r base-64 > js/bundle.js

# cors-proxy
RUN cd /usr/share/nginx/html/cors-proxy
RUN npm install http-proxy; \
	npm install proxy-from-env;

# USER node

RUN cd /usr/share/nginx/html
RUN ./node_modules/.bin/grunt

VOLUME ["/usr/share/nginx/html"]

# CMD ["/bin/sh", "-c", "tail -f /dev/null"]
CMD ["/bin/sh" , "-c", "node cors-proxy/server.js"]
