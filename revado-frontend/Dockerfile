# Step 1: Build the Angular app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Step 2: Serve the app using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/revado-frontend/browser /usr/share/nginx/html
# If your build path is different (e.g., just /dist/revado-frontend), update the path above
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]