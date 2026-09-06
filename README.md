# ClientPortal Lite

A centralized client-facing project workspace for freelancers, agencies, and software teams.
Clients can track progress, review deliverables, approve files, and communicate — all in one place.

---

## Tech Stack

| Layer      | Technology                                              |
|------------|--------------------------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security (JWT), JPA  |
| Database   | MySQL 8.x                                              |
| Frontend   | React 18, Vite 5, TypeScript, Tailwind CSS 3           |
| HTTP       | Axios, REST                                            |
| Icons      | Lucide React                                           |

---

## Project Structure

```
client-portal/
├── backend/                  # Spring Boot API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/clientportal/
│       │   ├── ClientPortalApplication.java
│       │   ├── config/           # DataInitializer, FileStorageConfig
│       │   ├── controller/       # REST endpoints
│       │   ├── dto/              # Request/Response DTOs
│       │   ├── entity/           # JPA entities
│       │   ├── exception/        # GlobalExceptionHandler
│       │   ├── repository/       # Spring Data JPA repos
│       │   ├── security/         # JWT filter, SecurityConfig
│       │   └── service/          # Business logic
│       └── resources/
│           ├── application.properties
│           └── schema.sql
└── frontend/                 # React + Vite SPA
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/              # Axios API modules
        ├── components/       # Shared UI components
        ├── context/          # AuthContext (JWT + role toggle)
        ├── pages/            # Route-level page components
        ├── types/            # TypeScript interfaces
        └── utils/            # formatDate, status helpers
```

---

## Prerequisites

Make sure the following are installed before starting:

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi) (or use the included wrapper)
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm 9+** (bundled with Node.js)

---

## Step 1 — Database Setup

Open MySQL and create the database (the app also does this automatically on first run, but creating it manually is safer):

```sql
CREATE DATABASE IF NOT EXISTS client_portal_lite
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

If your MySQL username or password differs from the defaults (`root` / `root`), update the credentials in:

```
backend/src/main/resources/application.properties
```

```properties
spring.datasource.username=root
spring.datasource.password=root
```

---

## Step 2 — Start the Backend

Open a terminal in the `backend/` folder:

```bash
# Windows (PowerShell)
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

```bash
# macOS / Linux
cd backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**

On first startup, `DataInitializer.java` automatically seeds the database with:

| Role   | Email                        | Password    |
|--------|------------------------------|-------------|
| ADMIN  | admin@clientportal.com       | admin123    |
| ADMIN  | sarah@clientportal.com       | admin123    |
| CLIENT | client@acmecorp.com          | client123   |
| CLIENT | client@designco.com          | client123   |

Two fully populated projects are created with milestones, tasks, deliverables, comments, activity logs, and notifications ready to demo.

---

## Step 3 — Start the Frontend

Open a **second terminal** in the `frontend/` folder:

```bash
# Install dependencies (first time only)
cd frontend
npm install

# Start dev server
npm run dev
```

The frontend starts on **http://localhost:5173**

All `/api/*` and `/uploads/*` requests are automatically proxied to `http://localhost:8080` via Vite's dev proxy — no CORS issues.

---

## Step 4 — Open the App

Navigate to **http://localhost:5173** in your browser.

Use the demo accounts above or click the quick-fill buttons on the login screen.

---

## Key Features Walkthrough

### Role Toggle (Demo Mode)
The **Admin / Client** toggle in the top header lets you instantly switch the view perspective without logging out. Use this during demos to show both sides of the portal.

### Admin View
- Create and manage projects, assign clients
- Add milestones and tasks, update progress
- Upload files and deliverables with version tags
- Respond to client comments and revision requests
- Monitor the live Activity Timeline

### Client View
- See project progress, health badge, and milestone timeline
- Access Pinned Resources (Figma, Drive, Notion links)
- Review and **approve** deliverables with one click
- **Request revisions** with a feedback modal
- Leave comments on tasks and deliverables
- Receive in-app notifications

### Kanban Board
Drag tasks between columns (To Do → In Progress → In Review → Done).
Click any task card to open details, change status, and view/add comments.

### PDF Executive Summary
Navigate to any project → click **Summary** → click **Print / Export PDF** to generate a complete project report including progress stats, milestones, deliverables, and activity.

### Notification Bell
Live badge count updates every 30 seconds. Click to view all notifications and mark as read.

---

## API Reference

All endpoints are prefixed with `/api`. JWT token must be sent as:
```
Authorization: Bearer <token>
```

| Method | Endpoint                                  | Description                    |
|--------|-------------------------------------------|--------------------------------|
| POST   | /api/auth/register                        | Register new user              |
| POST   | /api/auth/login                           | Login, returns JWT token       |
| GET    | /api/users/me                             | Current user profile           |
| GET    | /api/users/clients                        | List all client users          |
| GET    | /api/projects                             | List projects for current user |
| POST   | /api/projects                             | Create project (ADMIN)         |
| GET    | /api/projects/{id}                        | Get project with stats         |
| PUT    | /api/projects/{id}                        | Update project (ADMIN)         |
| DELETE | /api/projects/{id}                        | Delete project (ADMIN)         |
| GET    | /api/projects/{id}/milestones             | List milestones                |
| POST   | /api/projects/{id}/milestones             | Create milestone               |
| PATCH  | /api/projects/milestones/{id}/toggle      | Toggle milestone complete      |
| GET    | /api/projects/{id}/activity               | Activity timeline              |
| GET    | /api/tasks/project/{projectId}            | Tasks by project               |
| POST   | /api/tasks                                | Create task                    |
| PATCH  | /api/tasks/{id}/status                    | Update task status             |
| GET    | /api/deliverables/project/{projectId}     | Deliverables by project        |
| POST   | /api/deliverables/project/{id}/upload     | Upload file (multipart)        |
| POST   | /api/deliverables/project/{id}/link       | Add external link              |
| PATCH  | /api/deliverables/{id}/approve            | Approve deliverable (CLIENT)   |
| PATCH  | /api/deliverables/{id}/request-revision   | Request revision (CLIENT)      |
| GET    | /api/comments/task/{taskId}               | Comments on task               |
| POST   | /api/comments/task/{taskId}               | Add comment to task            |
| GET    | /api/comments/deliverable/{id}            | Comments on deliverable        |
| POST   | /api/comments/deliverable/{id}            | Add comment to deliverable     |
| GET    | /api/notifications                        | User notifications             |
| GET    | /api/notifications/unread-count           | Unread notification count      |
| PATCH  | /api/notifications/mark-all-read          | Mark all as read               |

---

## Configuration

### Database (backend/src/main/resources/application.properties)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/client_portal_lite?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

### JWT Secret
```properties
app.jwt.secret=ClientPortalLiteSecretKey2024VeryLongSecureRandomStringForJWTSigning
app.jwt.expiration-ms=86400000   # 24 hours
```

### File Uploads
Uploaded files are stored in the `uploads/` directory relative to where the backend is run.
Max file size is 25 MB (configurable in application.properties).

```properties
app.upload.dir=uploads
spring.servlet.multipart.max-file-size=25MB
```

---

## Build for Production

### Backend — create executable JAR
```bash
cd backend
mvn clean package -DskipTests
java -jar target/client-portal-backend-1.0.0.jar
```

### Frontend — create optimized build
```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

Serve `frontend/dist/` from any static host (Nginx, Vercel, Netlify) and update the API base URL in `src/api/axios.ts` to point to your deployed backend.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Access denied for user 'root'@'localhost'` | Update DB credentials in `application.properties` |
| `Port 8080 already in use` | Change `server.port` in `application.properties` |
| `Port 5173 already in use` | Change `port` in `vite.config.ts` |
| Frontend shows blank page | Make sure backend is running; check browser console for 401/CORS errors |
| `Table 'client_portal_lite.users' doesn't exist` | Run the backend once with `ddl-auto=create` then switch back to `update` |
| Seed data not appearing | Delete all rows in all tables and restart backend — DataInitializer only runs when `users` table is empty |
| File upload fails | Ensure the `uploads/` directory is writable by the Java process |

---

## Demo Credentials Summary

```
ADMIN  →  admin@clientportal.com   /  admin123
ADMIN  →  sarah@clientportal.com   /  admin123
CLIENT →  client@acmecorp.com      /  client123
CLIENT →  client@designco.com      /  client123
```

---

*Built for the 24-Hour Hackathon — ClientPortal Lite v1.0.0*
