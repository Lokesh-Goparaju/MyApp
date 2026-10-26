# Frontend API contract for Spring Boot

All requests use JSON. Configure CORS for the frontend origin. Use consistent ID types. The frontend expects collections as JSON arrays or `{ "content": [...] }`.

## Load data
- `GET /api/activities` → activity array
- `GET /api/jobs` → job array
- `GET /api/learning` → learning array

## Activities (daily tasks)
Fields: `id`, `title`, `category`, `date` (ISO `YYYY-MM-DD`), `notes`, `priority` (`Low`, `Medium`, `High`, `Urgent`), `status` (`Open`, `In Progress`, `Done`).
- `POST /api/activities` — create JSON body
- `PUT /api/activities/{id}` — update JSON body
- `DELETE /api/activities/{id}` — delete

Example body:
```json
{"title":"Study Spring Boot","category":"Study","date":"2026-10-25","notes":"Build a REST endpoint","priority":"High","status":"Open"}
```

## Job applications
Fields: `id`, `company`, `role`, `status` (`Interested`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`), `appliedDate`, `nextAction`.
- `POST /api/jobs`
- `PUT /api/jobs/{id}`
- `DELETE /api/jobs/{id}`

## Learning goals
Fields: `id`, `skill`, `status` (`Not Started`, `In Progress`, `Completed`, `On Hold`), `progress` (number 0–100), `targetDate`, `resource`.
- `POST /api/learning`
- `PUT /api/learning/{id}`
- `DELETE /api/learning/{id}`

## Responses and errors
Return JSON from successful GET/POST/PUT. A successful DELETE may return `204 No Content`. Error JSON can be `{ "message": "Useful error message" }`. The frontend does not implement a mock database; until the API exists, loading and CRUD requests report connection errors.
