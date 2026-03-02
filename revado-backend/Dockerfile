# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Create a data directory for SQLite
RUN mkdir /app/data
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Tell the app to look for the DB in the /app/data folder
ENTRYPOINT ["java", "-jar", "app.jar"]