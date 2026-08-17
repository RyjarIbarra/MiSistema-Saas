# ---- build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Copiar primero el pom cachea la descarga de dependencias:
# un cambio de codigo reconstruye en segundos, no en minutos.
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx512m"
# Forma sh -c para que $JAVA_OPTS se expanda.
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
