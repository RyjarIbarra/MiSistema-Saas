FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estaticos del front (estructura real del proyecto)
COPY index.html menu.html /usr/share/nginx/html/
COPY css/            /usr/share/nginx/html/css/
COPY js/             /usr/share/nginx/html/js/
COPY form/           /usr/share/nginx/html/form/
COPY assets/         /usr/share/nginx/html/assets/
COPY modificaciones/ /usr/share/nginx/html/modificaciones/
