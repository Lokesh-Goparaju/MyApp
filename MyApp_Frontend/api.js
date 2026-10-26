
/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE_URL = (
    window.APP_CONFIG?.API_BASE_URL ||
    "http://localhost:8080/api"
).replace(/\/+$/, "");


/* =========================================
   HTTP REQUEST HELPER
========================================= */

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(options.body !== undefined
                ? { "Content-Type": "application/json" }
                : {})
        }
    });

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            (typeof data === "string" && data) ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================
   RESPONSE HELPER
========================================= */

const unwrap = data =>
    Array.isArray(data)
        ? data
        : data?.content || data?.items || [];


/* =========================================
   API ACTIONS
========================================= */

async function api(action, type, id, payload) {
    const paths = {
        task: "/tasks",
        job: "/jobs",
        learning: "/learning"
    };

    // Load currently implemented backend data.
    if (action === "load") {
        const [tasks, learning] = await Promise.all([
            request("/tasks"),
            request("/learning")
        ]);

        return {
            tasks: unwrap(tasks),
            jobs: [],
            learning: unwrap(learning)
        };
    }

    const path = paths[type];

    if (!path) {
        throw new Error(`Unknown resource type: ${type}`);
    }

    switch (action) {
        case "create":
            return request(path, {
                method: "POST",
                body: JSON.stringify(payload)
            });

        case "update":
            return request(`${path}/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

        case "delete":
            return request(`${path}/${encodeURIComponent(id)}`, {
                method: "DELETE"
            });

        default:
            throw new Error(`Unknown API action: ${action}`);
    }
}
