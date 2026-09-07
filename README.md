# Speed Complaint

A Spring Boot + React app generated with JHipster 9.

## Tech stack

- Java / Spring Boot backend
- React frontend with TypeScript, Webpack, and Bootstrap
- Maven for the Java build
- npm for frontend dependencies and scripts

## Running locally

Make sure the backend and frontend ports are free:

- Backend: `http://localhost:8282`
- Frontend dev server: `http://localhost:9000` (via BrowserSync) and `http://localhost:9060` (Webpack)

### 1. Start the backend

```bash
./mvnw
```

### 2. Start the frontend

In a separate terminal:

```bash
npm run webapp:dev
```

The app will open at `http://localhost:9000` and proxy API calls to the backend on port `8282`.

## Common commands

| Task                  | Command                      |
| --------------------- | ---------------------------- |
| Install frontend deps | `npm install`                |
| Run backend tests     | `./mvnw verify`              |
| Run frontend tests    | `npm test`                   |
| Build production jar  | `./mvnw -Pprod clean verify` |
| Run production jar    | `java -jar target/*.jar`     |

## Notes

- Development uses an embedded H2 database by default. Check `application-dev.yml` to change it.
- The backend port was changed from `8080` to `8282` to avoid conflicts with Jenkins on `localhost:8080`.
