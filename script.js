const ADMIN_PASSWORD = "Admin12345";
let isAdmin = false;
let rooms = JSON.parse(
    localStorage.getItem("hotelRooms")
) 
[
    {number:"101", type:"Single", guest:"", date:""},
    {number:"102", type:"Single", guest:"", date:""},
    {number:"103", type:"Double", guest:"", date:""},
    {number:"104", type:"Double", guest:"", date:""},
    {number:"105", type:"Suite", guest:"", date:""},
    {number:"106", type:"Deluxe", guest:"", date:""}
]

function saveData() {
    localStorage.setItem(
        "hotelRooms",
        JSON.stringify(rooms)
    );
}

function showLoading(text, sub) {
    document.getElementById("loadingText")
        .textContent = text || "Processing...";
    document.getElementById("loadingSub")
        .textContent = sub || "Please wait";
    document.getElementById("loadingOverlay").hidden = false;
}

function hideLoading() {
    document.getElementById("loadingOverlay").hidden = true;
}

function showToast(message, type) {
    let container = document.getElementById("toastContainer");
    let toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : "");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 400);
    }, 2800);
}

function showConfirm(message, onConfirm) {
    document.getElementById("confirmMessage")
        .textContent = message;
    document.getElementById("confirmModal").hidden = false;
    let okBtn = document.getElementById("confirmOk");
    let cancelBtn = document.getElementById("confirmCancel");
    let newOk = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    let newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    newOk.onclick = () => {
        closeConfirm();
        onConfirm();
    };
    newCancel.onclick = closeConfirm;
}
function closeConfirm() {
    document.getElementById("confirmModal").hidden = true;
}

function openLoginModal() {
    document.getElementById("loginError").hidden = true;
    document.getElementById("adminPasswordInput").value = "";
    document.getElementById("loginModal").hidden = false;
    setTimeout(() => {
        document.getElementById("adminPasswordInput").focus();
    }, 150);
}
function closeLoginModal() {
    document.getElementById("loginModal").hidden = true;
}
function submitAdminLogin() {
    let pw = document.getElementById("adminPasswordInput").value;
    if (pw === ADMIN_PASSWORD) {
        closeLoginModal();
        showLoading("Verifying Administrator...", "Please wait");
        setTimeout(() => {
            isAdmin = true;
            document.getElementById("addRoomSection").hidden = false;
            document.getElementById("adminButton").textContent =
                "ADMIN LOGOUT";
            displayRooms();
            hideLoading();
            showToast("Welcome, Administrator!");
        }, 1400);
    } else {
        document.getElementById("loginError").hidden = false;
        showToast("Incorrect Administrator Password!", "error");
        document.getElementById("adminPasswordInput").value = "";
        document.getElementById("adminPasswordInput").focus();
    }
}

function adminLogin() {
    if (isAdmin) {
        showLoading("Logging out...", "Ending session");
        setTimeout(() => {
            isAdmin = false;
            document.getElementById("addRoomSection").hidden = true;
            document.getElementById("adminButton").textContent =
                "ADMIN LOGIN";
            displayRooms();
            hideLoading();
            showToast("Admin successfully logged out!");
        }, 900);
        return;
    }
    openLoginModal();
}

function toggleMenu() {
    document.getElementById("navLinks")
        .classList.toggle("active");
}
function closeMenu() {
    document.getElementById("navLinks")
        .classList.remove("active");
}

function updateDashboard() {
    let total = rooms.length;
    let occupied = rooms.filter(
        room => room.guest !== ""
    ).length;
    let available = total - occupied;
    let rate = total > 0
        ? Math.round((occupied / total) * 100)
        : 0;
    document.getElementById("total").textContent = total;
    document.getElementById("occupied").textContent =
        occupied;
    document.getElementById("available").textContent =
        available;
    document.getElementById("rate").textContent =
        rate + "%";
    document.getElementById("progressRate").textContent =
        rate + "%";
    document.getElementById("bar").style.width =
        rate + "%";
    document.getElementById("occupiedLabel").textContent =
        occupied;
    document.getElementById("availableLabel").textContent =
        available;
}

function updateRoomSelect() {
    let select = document.getElementById("roomSelect");
    let previousValue = select.value;
    select.innerHTML =
        '<option value="">Choose an available room</option>';
    rooms.forEach((room, index) => {
        if (!room.guest) {
            let option = document.createElement("option");
            option.value = index;
            option.textContent =
                room.number + " - " + room.type;
            select.appendChild(option);
        }
    });
    if (
        previousValue !== "" &&
        select.querySelector(`option[value="${previousValue}"]`)
    ) {
        select.value = previousValue;
    }
}

function displayRooms() {
    let table = document.getElementById("roomTable");
    let search = document.getElementById("search")
        .value.toLowerCase().trim();
    table.innerHTML = "";
    let filteredRooms = rooms
        .map((room, index) => ({room, index}))
        .filter(item =>
            item.room.number.toLowerCase().includes(search) ||
            item.room.guest.toLowerCase().includes(search)
        );
    if (filteredRooms.length === 0) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.colSpan = 6;
        cell.className = "empty-row";
        cell.textContent = "No rooms found.";
        row.appendChild(cell);
        table.appendChild(row);
    }
    filteredRooms.forEach(({room, index}) => {
        let row = document.createElement("tr");
        let status = room.guest
            ? "Occupied"
            : "Available";
        let values = [
            room.number,
            room.type,
            room.guest || "-",
            room.date || "-",
            status
        ];
        values.forEach((value, i) => {
            let cell = document.createElement("td");
            cell.textContent = value;
            if (i === 4) {
                cell.className = room.guest
                    ? "occupied"
                    : "available";
            }
            row.appendChild(cell);
        });
        let action = document.createElement("td");
        if (room.guest) {
            if (isAdmin) {
                let button = document.createElement("button");
                button.textContent = "Check Out";
                button.className = "checkout";
                button.onclick = () => checkOut(index);
                action.appendChild(button);
            } else {
                let locked = document.createElement("span");
                locked.textContent = "ADMIN ONLY";
                locked.className = "checkout-locked";
                locked.title =
                    "Only the administrator can check out guests.";
                action.appendChild(locked);
            }
        } else {
            action.textContent = "Ready";
        }
        row.appendChild(action);
        table.appendChild(row);
    });
    updateRoomSelect();
    updateDashboard();
}

function checkIn(event) {
    event.preventDefault();
    let guest = document.getElementById("guestName")
        .value.trim();
    let index = document.getElementById("roomSelect").value;
    if (guest === "" || index === "") {
        showToast("Please complete the guest information.", "error");
        return;
    }
    if (!rooms[index] || rooms[index].guest !== "") {
        showToast("This room is no longer available.", "error");
        displayRooms();
        return;
    }
    showLoading("Processing Check-in...", "Assigning room");
    setTimeout(() => {
        rooms[index].guest = guest;
        rooms[index].date =
            new Date().toLocaleDateString();
        saveData();
        displayRooms();
        document.getElementById("checkinForm").reset();
        hideLoading();
        showToast("Guest successfully checked in!");
    }, 1500);
}
function checkOut(index) {
    if (!isAdmin) {
        showToast(
            "ACCESS DENIED! Only Admin can check out guests.",
            "error"
        );
        return;
    }
    if (!rooms[index] || !rooms[index].guest) {
        return;
    }
    let guest = rooms[index].guest;
     showConfirm(
        "Check out " + guest + " from Room " +
        rooms[index].number + "?",
        () => {
            rooms[index].guest = "";
            rooms[index].date = "";
            saveData();
            displayRooms();
            showToast("Guest successfully checked out!");
        }
    );
}
 function addRoom(event) {
    event.preventDefault();
    if (!isAdmin) {
        showToast("Only the administrator can add rooms!", "error");
        return;
    }
    let number = document.getElementById("newRoom")
        .value.trim();
    let type = document.getElementById("roomType").value;
    if (number === "") {
        showToast("Please enter a room number.", "error");
        return;
    }
    let exists = rooms.some(room =>
        room.number.toLowerCase() === number.toLowerCase()
    );
    if (exists) {
        showToast("This room number already exists!", "error");
        return;
    }
    rooms.push({
        number: number,
        type: type,
        guest: "",
        date: ""
    });
    saveData();
    displayRooms();
    document.getElementById("addRoomForm").reset();
    showToast("New room successfully added!");
}
 document.getElementById("search").addEventListener(
    "input",
    displayRooms
);
 document.getElementById("checkinForm").addEventListener(
    "submit",
    checkIn
);
 document.getElementById("addRoomForm").addEventListener(
    "submit",
    addRoom
);
document.getElementById("loginCancel").addEventListener(
    "click",
    closeLoginModal
);
document.getElementById("loginSubmit").addEventListener(
    "click",
    submitAdminLogin
);
document.getElementById("adminPasswordInput").addEventListener(
    "keydown",
    (e) => { if (e.key === "Enter") submitAdminLogin(); }
);
displayRooms();
function smoothScrollTo(targetY, duration = 800) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;
    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(currentTime) {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min(
            (currentTime - startTime) / duration, 1
        );
        window.scrollTo(
            0,
            startY + distance * easeInOutCubic(progress)
        );
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(event) {
        const id = this.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        const navbarHeight =
            document.querySelector('.navbar').offsetHeight;
        const y =
            target.getBoundingClientRect().top +
            window.scrollY -
            navbarHeight;
        smoothScrollTo(Math.max(y, 0));
        history.replaceState(null, '', id);
        closeMenu();
    });
});
