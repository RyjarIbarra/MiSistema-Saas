# ---- build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:21-jre
# JasperReports necesita fuentes reales (si no, el PDF sale con cajitas)
# y modo headless (si no, revienta con HeadlessException).
RUN apt-get update \
 && apt-get install -y --no-install-recommends fontconfig fonts-dejavu \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx768m -Djava.awt.headless=true"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
