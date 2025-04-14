const notification = document.getElementById("notification"),
filters = document.querySelectorAll(".filter p"),
taskInput = document.getElementById("task-input"),
clearAll = document.getElementById("clearbtn"),
ul = document.getElementById("ul");


filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("p.active").classList.remove("active");
        btn.classList.add("active","hover:text-[#f382a6dc]");
        showTodo(btn.id);
    })
})

//getting time
const date = new Date();
let minutes = date.getMinutes();
let hours = date.getHours();
let period = hours >= 12 ? 'pm' : 'am';

hours = hours % 12;// converting hours to a 12-hour time
hours = hours ? hours : 12;// if it's 0 make it 12
const time = `${hours}:${minutes.toString().padStart(2, '0')}${period}`// adding 0 to the minute

//getting tasks saved in the localstorage
let todos = JSON.parse(localStorage.getItem("todo-list"));

function showTodo(filter) {
  let li = "";
  if (todos) {
    todos.forEach((todo, id) => {
      let isCompleted = todo.completed ? "checked" : "";

      if (
        filter === "all" ||
        (filter === "completed" && todo.completed) ||
        (filter === "pending" && !todo.completed) ||
        (filter === "pinned" && todo.status === "pinned")
      ) {
        li += `
          <li class="relative flex items-center justify-between w-full py-1.5 border-b-2 border-b-[#343A40]">
            ${todo.status === "pinned" ? 
              '<i class="fa-solid fa-thumbtack text-[#E3E3E3] absolute right-[453px] top-[14px]"></i>'
              : ""}
            <label for="${id}" class="flex items-center">
              <input
                type="checkbox"
                onclick="updateStatus(this)"
                class="w-[15px] h-[15px] rounded-lg mr-2 bg-[#484F59]"
                id="${id}"
                ${isCompleted}
              />
              <p class="text-lg text-[#E6E7E8] ${isCompleted}">${todo.name}</p>
            </label>
            <div class="flex items-center space-x-3">
              <p class="text-sm text-[#636466]">${todo.time}</p>
              <div class="relative group">
                <i
                  class="fas fa-ellipsis-h cursor-pointer text-[#E3E3E3] group-hover:scale-110 transition-transform"
                  onclick="showMenu(this)"
                  style="font-size: 24px"
                ></i>

                <!-- Submenu -->
                <ul class="absolute p-2 bg-[#484F59] rounded-lg top-[31px] left-[-14px] w-[165px] flex flex-col space-y-1 shadow-lg origin-top-left scale-0 z-10">
                  <i class="absolute left-[17px] top-[-13px] text-2xl text-[#484F59] fas fa-caret-up"></i>

                  <li class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition" onclick="PinTask(this)">
                    <i class="${todo.status === "pinned" ? "fa-solid fa-thumbtack-slash" : "fa-solid fa-thumbtack"} text-[#E3E3E3]"></i>
                    <p class="text-[#c4c4c4]">${todo.status === "pinned" ? "Unpin Task" : "Pin on the top"}</p>
                  </li>

                  <li class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition" onclick="deleteTask(${id})">
                    <i class="far fa-trash-alt text-[#E3E3E3]"></i>
                    <p class="text-[#c4c4c4]">Delete task</p>
                  </li>

                  ${!todo.completed ? `
                    <li class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition" onclick="editTask(${id}, '${todo.name}')">
                      <i class="far fa-edit text-[#E3E3E3]"></i>
                      <p class="text-[#c4c4c4]">Edit task</p>
                    </li>

                    <li class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition" onclick="showNotification(this, '${todo.name}')">
                      <i class="far fa-bell text-[#E3E3E3]"></i>
                      <p class="text-[#c4c4c4]">Notification</p>
                    </li>
                  ` : ""}
                </ul>
              </div>
            </div>
          </li>`;
      }
    });
  }

  ul.innerHTML = li || `<span class="text-[#d4d4d4] text-[17px]">You don't have any task here</span>`;
}

showTodo("all");

function PinTask(currentTask) {
  const taskParent = currentTask.parentElement.parentElement.parentElement.parentElement;
  const taskIndex = [...ul.children].indexOf(taskParent);
  const taskData = todos[taskIndex];

  // Check if there's already a pinned task (excluding the current one)
  const alreadyPinnedIndex = todos.findIndex((todo, index) => todo.status === "pinned" && index !== taskIndex);

  // If current task is not pinned and there's already one pinned, unpin it
  if (taskData.status !== "pinned" && alreadyPinnedIndex !== -1) {
    todos[alreadyPinnedIndex].status = "pending";
  }

  // Toggle pinning for the current task
// Toggle pinning
if (taskData.status !== "pinned") {
  taskData.status = "pinned";
  todos.splice(taskIndex, 1);
  todos.unshift(taskData);
} else {
  taskData.status = "pending";
  // ⬇️ Don't touch `completed`!
  todos.splice(taskIndex, 1);
  todos.push(taskData);
}



  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo("all");
}



//Notification function
const closeBtn = document.getElementById("close-btn");
const taskMsg = document.getElementById("taskMessage");

let outsideClickListener; // define this outside the function

let currentTaskid = null;

function showNotification(userNotificationBtn, taskInfo) {
  taskMsg.textContent = taskInfo;

  const parentLi = userNotificationBtn.parentElement.parentElement.parentElement.parentElement;
  currentTaskid = parseInt(parentLi.querySelector("input[type='checkbox']").id);

  openNotification();

  // Add listener for clicking outside the notification
  outsideClickListener = function (e) {
    const clickedInside = notification.contains(e.target) || userNotificationBtn.contains(e.target);
    if (!clickedInside) {
      closeNotification();
    }
  };

  document.addEventListener("click", outsideClickListener);
}
function openNotification() {
  notification.classList.remove("opacity-0", "scale-0", "left-[-350px]");
  notification.classList.add("left-4");
}

function closeNotification() {
  notification.classList.add("opacity-0", "scale-0", "left-[-350px]");
  notification.classList.remove("left-4");
  document.removeEventListener("click", outsideClickListener);
  outsideClickListener = null;
}

// Close button
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent triggering the outside click
  closeNotification();
});


const notificationBtn = document.getElementById("notificationBtn");
notificationBtn.addEventListener("click", () => {
  let countdownInterval;
  const timeInput = document.getElementById("timeInput");
  const timerCount = parseInt(timeInput.value);
  if(isNaN(timerCount) || timerCount <= 0){
    alert("please type a valid number");
    timeInput.value = "";
    return;
  }
  timeInput.value = "";
  
  if(Notification.permission !== "granted"){
    Notification.requestPermission()
  }

  notification.classList.remove("opacity-0", "scale-0", "left-[-350px]");
  notification.classList.add("left-4");
  
  const timeSelection = document.getElementById("unitSelect").value;

  let totalSeconds;
  if(timeSelection === "seconds")
    totalSeconds = timerCount;
  if(timeSelection === "minutes")
    totalSeconds = timerCount * 60;
  if(timeSelection === "hours")
    totalSeconds = timerCount * 3600;
  
  countdownInterval = setInterval(() => {
    totalSeconds--;
    console.log(totalSeconds)

    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      sendNotification("Timer done!", `Are you done with the task: ${todos[currentTaskid].name}`);
    
      if (currentTaskid !== null && todos[currentTaskid]) {
        if (todos[currentTaskid].status === "pinned") {
          todos[currentTaskid].completed = true; // ✅ add completed flag, don't change status
        } else {
          todos[currentTaskid].status = "completed";
        }
    
        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo("all");
        currentTaskid = null;
      }
    }
  }, 1000);
  
  
  function sendNotification(title, body){
    if(Notification.permission === "granted"){
      new Notification(title, {body});
    }
  }

  notification.classList.add("opacity-0", "scale-0", "left-[-350px]");
  notification.classList.remove("left-4");
  document.removeEventListener("click", outsideClickListener);
})

function handleNotificationclose() {
  notification.classList.remove("opacity-0", "scale-0", "left-[-350px]");
  notification.classList.add("left-4");
  document.removeEventListener("click", outsideClickListener);
}


let editId;
let isEditedTask = false;
function editTask(taskId, taskName){
    //editing selected task
    editId = taskId;
    isEditedTask = true;
    taskInput.value = taskName;
}

clearAll.addEventListener("click", () => {
    //removing all items of array/todos
    todos.splice(0, todos.length);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
})

function deleteTask(deleteNum){
    //removing selected tasks from array/todos
    todos.splice(deleteNum, 1);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
}

function showMenu(selectedTask){
    let taskMenu = selectedTask.parentElement.lastElementChild;
    taskMenu.classList.remove("scale-0");
    taskMenu.classList.add("transition-transform", "duration-200");

    document.addEventListener("click", (e) => {
        if(e.target.tagName != "I" || e.target != selectedTask){
            taskMenu.classList.add("scale-0");
        }
    })
}


function updateStatus(selectedTask){
  let taskName = selectedTask.parentElement.lastElementChild;
  let task = todos[selectedTask.id];

  if(selectedTask.checked){
      taskName.classList.add("checked");
      task.completed = true; // ✅ use completed flag
  } else {
      taskName.classList.remove("checked");
      task.completed = false;
  }

  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo("all");
}



taskInput.addEventListener("keyup", (e) => {
    let userTask = taskInput.value.trim();
    if(e.key === "Enter" && userTask){
        if (!isEditedTask){// if isEditedTask isn't true
            if(!todos){
                todos = [];//if todos doesn't exist pass an empty array
            }
            let taskInfo = { name: userTask, status: "pending", time: time, completed: false };
            todos.push(taskInfo);
        }else{
            isEditedTask = false;
            todos[editId].name = userTask;
        }
        taskInput.value = "";
        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo("all");
    }
});