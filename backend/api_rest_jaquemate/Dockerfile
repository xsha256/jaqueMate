# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Add non-root user for security
RUN groupadd -r chess && useradd -r -g chess chess
USER chess

COPY --from=build /app/target/*.war app.war

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.war"]