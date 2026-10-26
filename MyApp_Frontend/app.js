
const state = {
    tasks: [],
    jobs: [],
    learning: [],
    editing: null,
    taskView: "table",
    jobView: "table",
    month: new Date()
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const esc = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

const today = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const dateText = value => {
    if (!value) return "—";

    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
};

const slug = value =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

/* =========================================
   NOTIFICATIONS AND CONNECTION STATUS
========================================= */

function notify(message, error = false) {
    const element = $("#toast");

    if (!element) return;

    element.textContent = message;
    element.className = error ? "show error" : "show";

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        element.className = "";
    }, 3300);
}

function connection(connected) {
    const element = $("#connection");
    const dot = $("#statusDot");

    if (element) {
        element.textContent = connected
            ? "Backend connected"
            : "Backend not connected";
    }

    if (dot) {
        dot.style.background = connected ? "#739a78" : "#c5a36d";
    }
}

/* =========================================
   NAVIGATION
========================================= */

function go(page) {
    $$(".page").forEach(element => {
        element.classList.toggle("active", element.id === page);
    });

    $$(".nav").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    const nav = $(`.nav[data-page="${page}"]`);
    const crumb = $("#crumb");

    if (crumb) {
        crumb.textContent = nav?.textContent.trim() || page;
    }

    $("#sidebar")?.classList.remove("open");
    $("#scrim")?.classList.remove("show");
}

/* =========================================
   SHARED UI HELPERS
========================================= */

function pill(value, kind = "status") {
    return `<span class="${kind} ${kind}-${slug(value)}">${esc(value || "—")}</span>`;
}

function emptyRow(columns, message) {
    return `<tr><td colspan="${columns}" class="empty-row">${esc(message)}</td></tr>`;
}

function taskDate(task) {
    return task.dueDate || task.date || "";
}

/* =========================================
   TASKS
========================================= */

function renderTasks() {
    const search = ($("#taskSearch")?.value || "").toLowerCase();
    const filter = $("#taskFilter")?.value || "All statuses";

    const tasks = state.tasks.filter(task => {
        const searchable = [
            task.title,
            task.category,
            task.notes
        ].join(" ").toLowerCase();

        const status = task.status || "Open";

        return searchable.includes(search) &&
            (filter === "All statuses" || status === filter);
    });

    const rows = $("#tasksRows");

    if (rows) {
        rows.innerHTML = tasks.length
            ? tasks.map(task => `
                <tr>
                    <td><b>${esc(task.title)}</b></td>
                    <td><span class="category">${esc(task.category || "General")}</span></td>
                    <td>${dateText(taskDate(task))}</td>
                    <td title="${esc(task.notes)}">${esc(task.notes || "—")}</td>
                    <td>${pill(task.priority || "Medium", "priority")}</td>
                    <td>${pill(task.status || "Open")}</td>
                    <td class="actions">
                        <button data-edit="task" data-id="${esc(task.id)}">Edit</button>
                        <button data-delete="task" data-id="${esc(task.id)}">Delete</button>
                    </td>
                </tr>
            `).join("")
            : emptyRow(
                7,
                state.tasks.length
                    ? "No tasks match these filters."
                    : "No tasks yet — add your first task."
            );
    }

    const dueToday = state.tasks.filter(task =>
        taskDate(task) === today() &&
        !["Done", "Completed"].includes(task.status)
    );

    const todayTasks = $("#todayTasks");

    if (todayTasks) {
        todayTasks.innerHTML = dueToday.length
            ? dueToday.map(task => `
                <div class="focus-item">
                    <span>◯</span>
                    <div>
                        <b>${esc(task.title)}</b>
                        <small>
                            ${esc(task.category || "General")} ·
                            ${esc(task.priority || "Medium")} priority
                        </small>
                    </div>
                </div>
            `).join("")
            : `<div class="empty">No open tasks due today.</div>`;
    }

    renderCalendar();
    renderTaskBoard();
}

function renderCalendar() {
    const calendar = $("#calendar");
    if (!calendar) return;

    const year = state.month.getFullYear();
    const month = state.month.getMonth();

    const monthName = $("#monthName");

    if (monthName) {
        monthName.textContent = state.month.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        });
    }

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    let html = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        .map(day => `<div class="dayname">${day}</div>`)
        .join("");

    for (let index = 0; index < 42; index++) {
        let day;
        let currentMonth = month;
        let muted = false;

        if (index < offset) {
            day = previousMonthDays - offset + index + 1;
            currentMonth = month - 1;
            muted = true;
        } else if (index >= offset + days) {
            day = index - offset - days + 1;
            currentMonth = month + 1;
            muted = true;
        } else {
            day = index - offset + 1;
        }

        const key = [
            new Date(year, currentMonth, day, 12).getFullYear(),
            String(new Date(year, currentMonth, day, 12).getMonth() + 1).padStart(2, "0"),
            String(day).padStart(2, "0")
        ].join("-");

        const events = state.tasks.filter(task => taskDate(task) === key);

        html += `
            <div class="day ${muted ? "muted" : ""}">
                <span>${day}</span>
                ${events.slice(0, 3).map(task =>
                    `<small title="${esc(task.title)}">${esc(task.title)}</small>`
                ).join("")}
            </div>
        `;
    }

    calendar.innerHTML = html;
}

function renderTaskBoard() {
    const columns = $("#taskColumns");
    if (!columns) return;

    const statuses = ["Open", "In Progress", "Done"];

    columns.innerHTML = statuses.map(status => {
        const tasks = state.tasks.filter(task =>
            (task.status || "Open") === status
        );

        return `
            <section class="column">
                <h3>${status}<span>${tasks.length}</span></h3>
                ${tasks.map(task => `
                    <article class="board-card">
                        <b>${esc(task.title)}</b>
                        <p>${esc(task.category || "General")} · ${dateText(taskDate(task))}</p>
                        ${pill(task.priority || "Medium", "priority")}
                        <button data-edit="task" data-id="${esc(task.id)}">Edit</button>
                    </article>
                `).join("")}
            </section>
        `;
    }).join("");
}

/* =========================================
   JOB TRACKER UI
   API implementation will be added later.
========================================= */

function renderJobs() {
    const search = ($("#jobSearch")?.value || "").toLowerCase();

    const jobs = state.jobs.filter(job =>
        `${job.company || ""} ${job.role || job.position || ""} ${job.status || ""}`
            .toLowerCase()
            .includes(search)
    );

    const rows = $("#jobsRows");

    if (rows) {
        rows.innerHTML = jobs.length
            ? jobs.map(job => `
                <tr>
                    <td><b>${esc(job.company)}</b></td>
                    <td>${esc(job.role || job.position || "—")}</td>
                    <td>${pill(job.status || "Interested")}</td>
                    <td>${dateText(job.appliedDate || job.applicationDate)}</td>
                    <td>${esc(job.nextAction || "—")}</td>
                    <td class="actions">
                        <button data-edit="job" data-id="${esc(job.id)}">Edit</button>
                        <button data-delete="job" data-id="${esc(job.id)}">Delete</button>
                    </td>
                </tr>
            `).join("")
            : emptyRow(6, "No job applications yet.");
    }

    const statuses = [
        "Interested", "Applied", "Assessment",
        "Interview", "Offer", "Rejected"
    ];

    const columns = $("#jobColumns");

    if (columns) {
        columns.innerHTML = statuses.map(status => {
            const items = jobs.filter(job =>
                (job.status || "Interested") === status
            );

            return `
                <section class="column">
                    <h3>${status}<span>${items.length}</span></h3>
                    ${items.map(job => `
                        <article class="board-card">
                            <b>${esc(job.company)}</b>
                            <p>${esc(job.role || job.position || "")}</p>
                            <small>${dateText(job.appliedDate || job.applicationDate)}</small>
                            <button data-edit="job" data-id="${esc(job.id)}">Edit</button>
                        </article>
                    `).join("")}
                </section>
            `;
        }).join("");
    }
}

/* =========================================
   LEARNING TRACKER UI
   API implementation will be added later.
========================================= */

function renderLearning() {
    const items = state.learning;

    const cards = $("#learningCards");

    if (cards) {
        cards.innerHTML = items.length
            ? items.map(item => `
                <article class="learn-card">
                    <div class="learn-symbol">↗</div>
                    ${pill(item.status || "In Progress")}
                    <h3>${esc(item.skill || item.course || "Learning goal")}</h3>
                    <p>Target ${dateText(item.targetDate)}</p>
                    <div class="progress-label">
                        <span>Progress</span>
                        <b>${Number(item.progress) || 0}%</b>
                    </div>
                    <div class="track">
                        <i style="width:${Math.max(0, Math.min(100, Number(item.progress) || 0))}%"></i>
                    </div>
                    <button data-edit="learning" data-id="${esc(item.id)}">Edit</button>
                </article>
            `).join("")
            : `<div class="empty">Learning API not connected yet.</div>`;
    }

    const rows = $("#learningRows");

    if (rows) {
        rows.innerHTML = items.length
            ? items.map(item => `
                <tr>
                    <td><b>${esc(item.skill || item.course || "Learning goal")}</b></td>
                    <td>${pill(item.status || "In Progress")}</td>
                    <td>
                        <div class="progress-cell">
                            <div class="track">
                                <i style="width:${Math.max(0, Math.min(100, Number(item.progress) || 0))}%"></i>
                            </div>
                            ${Number(item.progress) || 0}%
                        </div>
                    </td>
                    <td>${dateText(item.targetDate)}</td>
                    <td>
                        ${item.resource
                            ? `<a href="${esc(item.resource)}" target="_blank" rel="noopener">Open ↗</a>`
                            : "—"}
                    </td>
                    <td class="actions">
                        <button data-edit="learning" data-id="${esc(item.id)}">Edit</button>
                        <button data-delete="learning" data-id="${esc(item.id)}">Delete</button>
                    </td>
                </tr>
            `).join("")
            : emptyRow(6, "Learning API not connected yet.");
    }
}

/* =========================================
   DASHBOARD AND ANALYTICS
========================================= */

function render() {
    renderTasks();
    renderJobs();
    renderLearning();

    const total = state.tasks.length;
    const done = state.tasks.filter(task =>
        ["Done", "Completed"].includes(task.status)
    ).length;

    const averageProgress = state.learning.length
        ? Math.round(
            state.learning.reduce(
                (sum, item) => sum + (Number(item.progress) || 0),
                0
            ) / state.learning.length
        )
        : 0;

    const setText = (selector, value) => {
        const element = $(selector);
        if (element) element.textContent = value;
    };

    setText(
        "#todayTotal",
        state.tasks.filter(task => taskDate(task) === today()).length
    );
    setText("#openTotal", total - done);
    setText("#jobTotal", state.jobs.length);
    setText("#learnAvg", `${averageProgress}%`);
    setText("#taskCount", total - done);
    setText("#jobOverview", `${state.jobs.length} applications`);
    setText("#learnOverview", `${state.learning.length} learning goals`);
    setText(
        "#taskOverview",
        `${total ? Math.round(done / total * 100) : 0}% completed`
    );
    setText("#analyticsDone", done);
    setText("#analyticsJobs", state.jobs.length);
    setText("#analyticsLearning", `${averageProgress}%`);

    const jobBar = $("#jobBar");
    if (jobBar) jobBar.style.width = `${Math.min(100, state.jobs.length * 10)}%`;

    const learnBar = $("#learnBar");
    if (learnBar) learnBar.style.width = `${averageProgress}%`;

    const taskBar = $("#taskBar");
    if (taskBar) taskBar.style.width = `${total ? done / total * 100 : 0}%`;

    const taskBars = $("#taskBars");

    if (taskBars) {
        taskBars.innerHTML = [0, 1, 2, 3, 4, 5, 6]
            .map(() => `
                <div style="height:${Math.max(8, Math.random() * 80)}%"
                     title="Illustrative weekly activity"></div>
            `).join("");
    }

    const statuses = [
        "Interested", "Applied", "Assessment",
        "Interview", "Offer", "Rejected"
    ];

    const jobBreakdown = $("#jobBreakdown");

    if (jobBreakdown) {
        jobBreakdown.innerHTML = statuses.map(status => `
            <div class="break-row">
                <span>${status}</span>
                <b>${state.jobs.filter(job =>
                    (job.status || "Interested") === status
                ).length}</b>
            </div>
        `).join("");
    }

    const learningBreakdown = $("#learningBreakdown");

    if (learningBreakdown) {
        learningBreakdown.innerHTML = state.learning.map(item => `
            <div class="break-row">
                <span>${esc(item.skill || item.course || "Learning goal")}</span>
                <b>${Number(item.progress) || 0}%</b>
            </div>
        `).join("") || "<small>No learning goals yet.</small>";
    }
}

/* =========================================
   FORM SCHEMAS
========================================= */

const schema = {
    task: [
        { k: "title", l: "Task name", type: "text", req: true },
        {
            k: "category", l: "Category", type: "select",
            opts: ["Study", "Work", "Personal", "Health", "Finance", "Creative", "General"]
        },
        { k: "dueDate", l: "Due date", type: "date" },
        { k: "notes", l: "Notes", type: "textarea", full: true },
        {
            k: "priority", l: "Priority", type: "select",
            opts: ["Low", "Medium", "High", "Urgent"]
        },
        {
            k: "status", l: "Status", type: "select",
            opts: ["Open", "In Progress", "Done"]
        }
    ],
    job: [
        { k: "company", l: "Company", type: "text", req: true },
        { k: "role", l: "Position", type: "text", req: true },
        {
            k: "status", l: "Status", type: "select",
            opts: ["Interested", "Applied", "Assessment", "Interview", "Offer", "Rejected"]
        },
        { k: "appliedDate", l: "Application date", type: "date" },
        { k: "nextAction", l: "Next action", type: "text", full: true }
    ],
    learning: [
        { k: "skill", l: "Skill / Course", type: "text", req: true },
        {
            k: "status", l: "Status", type: "select",
            opts: ["Not Started", "In Progress", "Completed", "On Hold"]
        },
        { k: "progress", l: "Progress (%)", type: "number", min: 0, max: 100 },
        { k: "targetDate", l: "Target date", type: "date" },
        { k: "resource", l: "Resource URL", type: "url", full: true }
    ]
};

/* =========================================
   CREATE / EDIT FORM
========================================= */

function openEditor(type, id = null) {
    if (!schema[type]) {
        notify("Unknown item type.", true);
        return;
    }

    const collection = type === "task"
        ? state.tasks
        : type === "job"
            ? state.jobs
            : state.learning;

    const item = id
        ? collection.find(value => String(value.id) === String(id))
        : null;

    if (id && !item) {
        notify("Item not found.", true);
        return;
    }

    state.editing = { type, id };

    $("#modalTitle").textContent =
        (item ? "Edit " : "New ") +
        ({ task: "task", job: "job application", learning: "learning goal" }[type]);

    $("#fields").innerHTML = schema[type].map(field => {
        let value = item?.[field.k];

        if (type === "task" && field.k === "dueDate") {
            value = item?.dueDate || item?.date;
        }

        if (value == null) {
            if (field.k === "status") {
                value = type === "job"
                    ? "Interested"
                    : type === "learning"
                        ? "Not Started"
                        : "Open";
            } else if (field.k === "priority") {
                value = "Medium";
            } else if (["dueDate", "appliedDate"].includes(field.k)) {
                value = today();
            } else if (field.k === "progress") {
                value = 0;
            } else {
                value = "";
            }
        }

        let input;

        if (field.type === "select") {
            input = `
                <select name="${field.k}">
                    ${field.opts.map(option => `
                        <option value="${esc(option)}"
                            ${option === value ? "selected" : ""}>
                            ${esc(option)}
                        </option>
                    `).join("")}
                </select>
            `;
        } else if (field.type === "textarea") {
            input = `<textarea name="${field.k}">${esc(value)}</textarea>`;
        } else {
            input = `
                <input
                    name="${field.k}"
                    type="${field.type}"
                    value="${esc(value)}"
                    ${field.req ? "required" : ""}
                    ${field.min !== undefined
                        ? `min="${field.min}" max="${field.max}"`
                        : ""}
                >
            `;
        }

        return `
            <div class="field ${field.full ? "full" : ""}">
                <label>${esc(field.l)}</label>
                ${input}
            </div>
        `;
    }).join("");

    const editor = $("#editor");

    if (editor?.showModal) {
        editor.showModal();
    } else {
        notify("Editor dialog not found in index.html.", true);
    }
}

/* =========================================
   SAVE / DELETE
========================================= */

async function save(event) {
    event.preventDefault();

    if (!state.editing) return;

    const { type, id } = state.editing;
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    if (type === "learning") {
        payload.progress = Number(payload.progress || 0);
    }

    try {
        await api(id ? "update" : "create", type, id, payload);

        notify(id ? "Changes saved." : "Item created.");

        $("#editor").close();
        await load();
    } catch (error) {
        notify(error.message || "Unable to save item.", true);
    }
}

async function remove(type, id) {
    if (!confirm("Delete this item? This cannot be undone.")) {
        return;
    }

    try {
        await api("delete", type, id);

        notify("Item deleted.");
        await load();
    } catch (error) {
        notify(error.message || "Unable to delete item.", true);
    }
}

/* =========================================
   LOAD FROM BACKEND
========================================= */

async function load() {
    try {
        const data = await api("load");

        state.tasks = data.tasks || [];
        state.jobs = data.jobs || [];
        state.learning = data.learning || [];

        connection(true);
        render();
    } catch (error) {
        connection(false);
        render();

        notify(
            "Could not load tasks. Check that Spring Boot is running and the API URL is correct.",
            true
        );

        console.error("Backend loading failed:", error);
    }
}

/* =========================================
   EVENT LISTENERS
========================================= */

function initializeApp() {
    $$(".nav").forEach(button => {
        button.addEventListener("click", () => go(button.dataset.page));
    });

    $$("[data-go]").forEach(button => {
        button.addEventListener("click", () => go(button.dataset.go));
    });

    $("#openNav")?.addEventListener("click", () => {
        $("#sidebar")?.classList.add("open");
        $("#scrim")?.classList.add("show");
    });

    const closeNav = () => {
        $("#sidebar")?.classList.remove("open");
        $("#scrim")?.classList.remove("show");
    };

    $("#closeNav")?.addEventListener("click", closeNav);
    $("#scrim")?.addEventListener("click", closeNav);

    $$("[data-add]").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.add;

            if (type !== "task") {
                notify("This module's backend is not connected yet.", true);
                return;
            }

            openEditor(type);
        });
    });

    $("#dismiss")?.addEventListener("click", () => $("#editor")?.close());
    $("#cancel")?.addEventListener("click", () => $("#editor")?.close());

    $("#editorForm")?.addEventListener("submit", save);

    $("#taskSearch")?.addEventListener("input", renderTasks);
    $("#taskFilter")?.addEventListener("change", renderTasks);
    $("#jobSearch")?.addEventListener("input", renderJobs);

    $("#prevMonth")?.addEventListener("click", () => {
        state.month.setMonth(state.month.getMonth() - 1);
        renderCalendar();
    });

    $("#nextMonth")?.addEventListener("click", () => {
        state.month.setMonth(state.month.getMonth() + 1);
        renderCalendar();
    });

    $$("[data-taskview]").forEach(button => {
        button.addEventListener("click", () => {
            state.taskView = button.dataset.taskview;

            $$("[data-taskview]").forEach(item => {
                item.classList.toggle("selected", item === button);
            });

            ["table", "calendar", "board"].forEach(view => {
                const element = $("#task" + view[0].toUpperCase() + view.slice(1));
                element?.classList.toggle("selected", view === state.taskView);
            });
        });
    });

    $$("[data-jobview]").forEach(button => {
        button.addEventListener("click", () => {
            state.jobView = button.dataset.jobview;

            $$("[data-jobview]").forEach(item => {
                item.classList.toggle("selected", item === button);
            });

            ["table", "board"].forEach(view => {
                const element = $("#job" + view[0].toUpperCase() + view.slice(1));
                element?.classList.toggle("selected", view === state.jobView);
            });
        });
    });

    document.addEventListener("click", event => {
        const editButton = event.target.closest("[data-edit]");

        if (editButton) {
            if (editButton.dataset.edit !== "task") {
                notify("This module's backend is not connected yet.", true);
                return;
            }

            openEditor(editButton.dataset.edit, editButton.dataset.id);
            return;
        }

        const deleteButton = event.target.closest("[data-delete]");

        if (deleteButton) {
            if (deleteButton.dataset.delete !== "task") {
                notify("This module's backend is not connected yet.", true);
                return;
            }

            remove(deleteButton.dataset.delete, deleteButton.dataset.id);
        }
    });

    const todayElement = $("#today");

    if (todayElement) {
        todayElement.textContent = new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    }

    load();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}
