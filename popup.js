const taskInput = document.getElementById("taskInput");
const addtaskBtn = document.getElementById("addTaskBtn");
const todoList = document.getElementById("todoList");
const todayBtn = document.querySelector(".todayTasksButton");
const doneBtn = document.querySelector(".doneTasksButton");

let tasks = []; // [{ id, text, done }]
let doneTasks = [];
let currentView = "today";

// FIRST SECTION -> TODAY ---------------------------------------------------------------------

function loadAllTasks() {
    chrome.storage.sync.get({ tasks: [], doneTasks: [] }, function (data) {
        tasks = data.tasks;
        doneTasks = data.doneTasks;
        render();
    });
}

// function to save tasks
function saveTask() {
    chrome.storage.sync.set({ tasks: tasks, doneTasks: doneTasks });
}

// function to add new tasks
function addTask() {
    const task = taskInput.value.trim();

    if (task) {
        addTaskDOM(task);
        updateStorage();
    }
    
    taskInput.value = "";
    taskInput.classList.add("off");
}

// function to add the task as a list item  
function addTaskDOM(task) {
    const li = document.createElement("li");
    li.className = "li";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task;

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";

    li.appendChild(text);

    if (currentView === "today") {
        const img = document.createElement("img"); // check button: Today -> Done
        img.src = "./imgs/check-svgrepo-com.svg";
        img.alt = "Blue Check SVG";
        deleteBtn.appendChild(img);

        deleteBtn.onclick = () => {
            doneTasks.push(task);
            li.remove();
            updateStorage();
        };
    } else {
        const restoreBtn = document.createElement("span"); // restore button: Done -> Today
        restoreBtn.className = "restore-btn";
        restoreBtn.textContent = "↩";
        restoreBtn.onclick = () => {
            tasks.push(task);
            li.remove();
            updateStorage();
        };
        li.appendChild(restoreBtn);

        // delete button: removes for good
        deleteBtn.textContent = "✕";
        deleteBtn.onclick = () => {
            li.remove();
            updateStorage();
        };
    }

    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

// rebuilds the array of the current section from the DOM and saves both arrays
function updateStorage() {
    const list = [];

    document.querySelectorAll("#todoList li").forEach(li => {
        const taskText = li.querySelector(".task-text").textContent.trim();
        if (taskText) {
            list.push(taskText);
        }
    });
    
    if (currentView === "today") {
        tasks = list;
    } else {
        doneTasks = list;
    }

    saveTask();
}

// draws the tasks of the current section
function render() {
    const showingDone = currentView === "done";
    const list = showingDone ? doneTasks : tasks;

    todoList.innerHTML = ""; // clean before the rebuild
    list.forEach(task => addTaskDOM(task));

    // can only add tasks in Today
    addtaskBtn.classList.toggle("off", showingDone);
    if (showingDone) taskInput.classList.add("off");

    todayBtn.classList.toggle("active", !showingDone);
    doneBtn.classList.toggle("active", showingDone);
}

// function to handle with the display of the taskInput
function handleAddClick() {
    if (taskInput.classList.contains("off")) {
        taskInput.classList.remove("off");
        taskInput.focus();
        return;
    }

    addTask();
}


// SECOND SECTION -> DONE ---------------------------------------------------------------------

function switchView(view) {
    currentView = view;
    render();
}


// EVENT LISTENERS ----------------------------------------------------------------------------

addtaskBtn.addEventListener("click", handleAddClick);
taskInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});
todayBtn.addEventListener("click", () => switchView("today"));
doneBtn.addEventListener("click", () => switchView("done"));


// INICIAL LOAD -------------------------------------------------------------------------------

loadAllTasks();