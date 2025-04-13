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

//getting tasks saved in the localstorage
let todos = JSON.parse(localStorage.getItem("todo-list"));

function showTodo(filter){
    let li = "";
    if(todos){
        todos.forEach((todo,id) => {
            //if todo status is completed, set the isCompleted value to checked
            let isCompleted = todo.status == "completed" ? "checked" : "";
            if(filter == todo.status || filter == "all"){
                li += `
                        <li class="relative flex items-center justify-between w-full py-1.5 border-b-2 border-b-[#343A40]">
                          <img
                                  src="keep_off_24dp_E3E3E3_FILL0_wght300_GRAD0_opsz24.png"
                                  alt="unpin"
                                  class="absolute h-6 right-[450px] top-[6px]"
                          />
                          <label for="${id}" class="flex items-center">
                            <input
                              type="checkbox"
                              onclick="updateStatus(this)"
                              class="w-[15px] h-[15px] rounded-lg mr-2 bg-[#484F59]"
                              id="${id}"
                              ${isCompleted}
                            />
                            <p class="text-lg text-[#E6E7E8] ${isCompleted}" >${todo.name}</p>
                          </label>
                          <div class="flex items-center space-x-3">
                            <p class="text-sm text-[#636466]">9:40pm</p>
                            <div class="relative group">
                              <i
                                class="fas fa-ellipsis-h cursor-pointer text-[#E3E3E3] group-hover:scale-110 transition-transform"
                                onclick="showMenu(this)"
                                style="font-size: 24px"
                              ></i>
                
                              <!-- Submenu -->
                              <ul
                                class="absolute p-2 bg-[#484F59] rounded-lg top-[31px] left-[-14px] w-[165px] flex flex-col space-y-1 shadow-lg origin-top-left scale-0 z-10"
                              >
                                <i
                                  class="absolute left-[17px] top-[-13px] text-2xl text-[#484F59] fas fa-caret-up"
                                ></i>
                
                                <li
                                  class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition"
                                >
                                  <i
                                    class="fa-solid fa-thumbtack text-[#E3E3E3]"/* fa-solid fa-thumbstack */
                                  ></i>
                                  <p class="text-[#c4c4c4]">Pin on the top</p>
                                </li>
                                <li
                                  class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition"
                                  onclick="editTask(${id}, '${todo.name}')"
                                >
                                  <i class="far fa-edit text-[#E3E3E3]"></i>
                                  <p class="text-[#c4c4c4]">Edit task</p>
                                </li>
                                <li
                                  class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition"
                                  onclick="deleteTask(${id})"
                                >
                                  <i class="far fa-trash-alt text-[#E3E3E3]"></i>
                                  <p class="text-[#c4c4c4]">Delete task</p>
                                </li>
                                ${todo.status !== "completed" ? `
                                  <li
                                    class="flex items-center w-full space-x-2.5 cursor-pointer hover:bg-[#5a626f] p-1.5 rounded transition"
                                    onclick="showNotification(this, '${todo.name}')"
                                  >
                                    <i class="far fa-bell text-[#E3E3E3]"></i>
                                    <p class="text-[#c4c4c4]">Notification</p>
                                  </li>
                                `:""}
                              </ul>
                            </div>
                          </div>
                        </li>`
            }
        })
    }
    //if li isn't empty then li will show if not span will show
    ul.innerHTML = li || `<span class="text-[#d4d4d4] text-[17px]">You don't have any task here</span>`;

}

showTodo("all");

//Notification function
const closeBtn = document.getElementById("close-btn");
const taskMsg = document.getElementById("taskMessage");

let outsideClickListener; // define this outside the function

let currentTaskid = null;

function showNotification(userNotificationBtn, taskInfo) {
  taskMsg.textContent = taskInfo;
  handleNotificationclose();

  const parentLi = userNotificationBtn.parentElement.parentElement.parentElement.parentElement;
  currentTaskid = parseInt(parentLi.querySelector("input[type='checkbox']").id);

  outsideClickListener = function (e) {
    if (
      !notification.contains(e.target) &&
      e.target !== userNotificationBtn &&
      e.target !== userNotificationBtn.lastElementChild
    ) {
      notification.classList.add("opacity-0", "scale-0", "left-[-350px]");
      notification.classList.remove("left-4");
      document.removeEventListener("click", outsideClickListener);
    }
  };

  // Add the listener
  document.addEventListener("click", outsideClickListener);

  // Close button
  closeBtn.addEventListener("click", () => {
    handleNotificationclose();
  });
}


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

    if(totalSeconds <= 0){
      clearInterval(countdownInterval);
      sendNotification("Timer done!", `Are you done with the task: ${todos[currentTaskid].name}`);

      if(currentTaskid !== null && todos[currentTaskid]){
        todos[currentTaskid].status = "completed";
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
    if(selectedTask.checked){
        taskName.classList.add("checked");
        //changing the status of clicked task to completed
        todos[selectedTask.id].status = "completed";
    }else{
        taskName.classList.remove("checked");
        //changing the status of clicked task to pending
        todos[selectedTask.id].status = "pending";
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
            let taskInfo = {name: userTask, status: "pending"};
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