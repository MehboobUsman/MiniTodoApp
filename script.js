// Mini To-Do
// This file handles adding, completing, deleting, and saving tasks.

// The key we use inside the browser's localStorage.
const STORAGE_KEY = "mini-todo-tasks";

// Grab the pieces of the page we need to work with.
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");

// Start with whatever was saved last time. If nothing is saved, use an empty list.
let tasks = loadTasks();

// Draw the list as soon as the page opens.
renderTasks();

// Adding a task: listen for the form submit (Enter key or the Add button).
form.addEventListener("submit", function (event) {
  // Stop the browser from reloading the page.
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") {
    return;
  }

  // Each task gets a unique id, the typed text, and a completed flag.
  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  input.value = "";
  saveTasks();
  renderTasks();
  input.focus();
});

// One listener on the list handles both checkboxes and delete buttons.
// This is called event delegation: we do not attach a listener to every task.
list.addEventListener("click", function (event) {
  const taskItem = event.target.closest(".task");
  if (!taskItem) {
    return;
  }

  const id = Number(taskItem.dataset.id);

  if (event.target.classList.contains("delete-btn")) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
    saveTasks();
    renderTasks();
  }
});

list.addEventListener("change", function (event) {
  if (!event.target.classList.contains("task-check")) {
    return;
  }

  const taskItem = event.target.closest(".task");
  const id = Number(taskItem.dataset.id);
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  if (task) {
    task.completed = event.target.checked;
    saveTasks();
    renderTasks();
  }
});

// Read the saved list. If the data is missing or broken, start fresh.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    return [];
  }
}

// Write the current list back to localStorage as a JSON string.
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Rebuild the visible list from the tasks array.
function renderTasks() {
  // Clear the old items before drawing the new ones.
  list.innerHTML = "";

  tasks.forEach(function (task) {
    const item = document.createElement("li");
    item.className = "task" + (task.completed ? " completed" : "");
    item.dataset.id = String(task.id);

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark \"" + task.text + "\" complete");

    const text = document.createElement("span");
    text.className = "task-text";
    // textContent keeps user text as plain text (safer than innerHTML).
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete \"" + task.text + "\"");

    label.append(checkbox, text);
    item.append(label, deleteButton);
    list.append(item);
  });

  updateSummary();
}

// Update the count line and show the empty message only when the list is blank.
function updateSummary() {
  const total = tasks.length;
  const done = tasks.filter(function (task) {
    return task.completed;
  }).length;

  if (total === 0) {
    count.textContent = "No tasks yet";
    emptyState.classList.remove("hidden");
  } else {
    const remaining = total - done;
    count.textContent = remaining + " left · " + done + " done";
    emptyState.classList.add("hidden");
  }
}
