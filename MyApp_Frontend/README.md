# Personal OS — Frontend only

A Notion-inspired personal productivity frontend built with **HTML, CSS, and vanilla JavaScript**. This is the frontend only: you will create the Java Spring Boot backend and MySQL database with me step by step, so you can learn the full stack instead of receiving a finished backend.

## Included UI
- Sidebar navigation: Dashboard, To Do, Job Applications, Learning, Analytics
- Daily planner columns: Task, Category, Due Date, Notes, Priority, Status
- Task views: Table, Calendar, Board
- Job tracker columns: Company, Position, Status, Application Date, Next Action; table and board views
- Learning tracker columns: Skill / Course, Status, Progress, Target Date, Resource
- Responsive Notion-inspired styling, no cover images
- Create/edit/delete forms wired to a separate HTTP adapter (`api.js`)
- `API-CONTRACT.md` documenting the endpoints expected by this frontend

## Run the frontend now
You can inspect the UI before the backend exists. In this folder run:

```bash
python3 -m http.server 5500
```

Open http://localhost:5500. The app will show that the backend is not connected until your API is running. CRUD requests will not persist until the backend endpoints exist.

## Connect your Spring Boot API later
Edit `config.js` and set `API_BASE_URL`, for example `http://localhost:8080/api`. Then implement the endpoints in `API-CONTRACT.md`. During local development, configure Spring Boot CORS to allow `http://localhost:5500`. For GitHub Pages, your backend must be deployed separately to a public HTTPS host and allow your exact GitHub Pages origin. Do not put database credentials in frontend files.

## GitHub Pages
Push these frontend files to a GitHub repository and enable Pages from the repository's Settings. GitHub Pages hosts static files only; it does not run Java or MySQL. Deploy the Spring Boot backend and MySQL database separately, then update `config.js` to use the deployed HTTPS API URL.

## Suggested learning sequence
1. Build a Spring Boot project and a health endpoint (`GET /api/health`).
2. Add MySQL connection configuration in `application.properties` using environment variables for secrets.
3. Build Activity entity, repository, service, and controller.
4. Test `GET`, `POST`, `PUT`, and `DELETE /api/activities` with Postman.
5. Connect the frontend and verify task CRUD.
6. Repeat for jobs and learning goals; then add subtasks and analytics.

Email reminders and Google Calendar integration are intentionally not included yet.
