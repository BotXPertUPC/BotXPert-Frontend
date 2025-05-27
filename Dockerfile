# Etapa 1: build del frontend
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: nginx per servir estàtics
FROM nginx:alpine

# Copiem el build al directori de nginx
COPY --from=build /app/build /usr/share/nginx/html

# Opcional: custom nginx.conf si cal
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
