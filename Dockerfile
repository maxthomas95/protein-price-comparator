FROM nginx:alpine

WORKDIR /srv
COPY . /srv

# Point nginx to your actual app folder
COPY ppc/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
