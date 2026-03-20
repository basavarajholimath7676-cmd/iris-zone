# GeoCapture

GeoCapture is a Location and Photo Capture Web Application designed for capturing real-time location data and photographic evidence.

## Features
- Real-time location capture (Latitude, Longitude, and Accuracy).
- Address enhancement using reverse geocoding.
- Mandatory photo capture for evidence.
- Secure data submission to a MySQL backend.
- Dark glassmorphism UI design.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Java 17** or higher
- **Maven 3.6+**
- **MySQL Server 8.0+**

## Getting Started

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or Command Line).
2. Create a new database named `geocapture`:
   ```sql
   CREATE DATABASE geocapture;
   ```

### 2. Configuration
1. Navigate to `src/main/resources/application.properties`.
2. Update the following properties with your MySQL credentials:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 3. Build the Project
Open a terminal in the project root directory and run:
```bash
mvn clean install
```

### 4. Run the Application
Start the Spring Boot application using Maven:
```bash
mvn spring-boot:run
```

### 5. Access the Application
Once the application starts successfully, open your web browser and navigate to:
[http://localhost:8080/index.html](http://localhost:8080/index.html)

## Command Reference

### Database Commands
- **Login to MySQL CLI:**
  ```bash
  mysql -u root -p
  ```
- **Create Database:**
  ```sql
  CREATE DATABASE geocapture;
  ```

### Maven Commands
- **Clean and Build:**
  ```bash
  mvn clean install
  ```
- **Run Application:**
  ```bash
  mvn spring-boot:run
  ```
- **Run Tests:**
  ```bash
  mvn test
  ```
- **Package as JAR:**
  ```bash
  mvn package
  ```

### Running the Executable JAR
Once packaged, you can run the application directly:
```bash
java -jar target/geocapture-1.0.0.jar
```

## Project Structure
- `src/main/java`: Backend source code (Spring Boot).
- `src/main/resources/static`: Frontend assets (HTML, CSS, JS).
- `src/main/resources/application.properties`: Application configuration.
