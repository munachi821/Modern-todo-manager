const notification = document.getElementById("notification");

const notificationBtn = document.getElementById("notificationbtn").addEventListener("click", () => {
    notification.classList.remove("opacity-0", "scale-0", "left-[-350px]");
    notification.classList.add("left-4");
});
