// Global variable to track the next user ID
let userIdCounter = 0;

// Get elements
const addUserBtn = document.getElementById("addUserBtn");
const userFormContainer = document.getElementById("userFormContainer");
const userForm = document.getElementById("userForm");
const cancelBtn = document.getElementById("cancelBtn");
const userTableBody = document.getElementById("userTableBody");

// Predefined list of departments (since the API does not provide it)
const departments = ["Engineering", "Marketing", "HR", "Sales","Finance"];

// Fetch users from API and display them in the table
async function fetchUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
            throw new Error("Failed to fetch users.");
        }

        const users = await response.json();
        displayUsers(users);

        // Find the highest existing ID and set the counter
        const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
        userIdCounter = maxId + 1;
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to load user data.");
    }
}

// Function to display users in the table
function displayUsers(users) {
    userTableBody.innerHTML = ""; // Clear existing data

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name.split(" ")[0]}</td>
            <td>${user.name.split(" ")[1] || ""}</td>
            <td>${user.email}</td>
            <td>${departments[index % departments.length]}</td>
            <td>
                <button class="edit-btn" data-id="${user.id}">Edit</button>
                <button class="delete-btn" data-id="${user.id}">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });

    // Attach event listeners for Edit and Delete buttons
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            const userId = event.target.getAttribute("data-id");
            editUser(userId);
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            const userId = event.target.getAttribute("data-id");
            deleteUser(userId);
        });
    });
}

// Show the form when clicking "Add User"
addUserBtn.addEventListener("click", () => {
    console.log("Add User button clicked");
    userFormContainer.classList.remove("hidden");
    userFormContainer.style.display = "block";
    userFormContainer.scrollIntoView({ behavior: "smooth", block: "center" });

    // Assign the next available user ID
    document.getElementById("userId").value = userIdCounter;

    // Switch form mode to Add
    document.getElementById("formTitle").innerText = "Add User";

    // Ensure Add event listener is active
    userForm.removeEventListener("submit", updateUserHandler);
    userForm.addEventListener("submit", handleAddUser);
});

// Hide the form when clicking "Cancel"
cancelBtn.addEventListener("click", () => {
    console.log("Cancel button clicked");
    userFormContainer.style.display = "none";
    userForm.reset();
});

// Handle adding a new user
function handleAddUser(event) {
    event.preventDefault();

    // Get input values
    const userId = userIdCounter++;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value;

    if (!firstName || !lastName || !email || !department) {
        alert("Please fill in all fields.");
        return;
    }

    const newUser = { id: userId, name: `${firstName} ${lastName}`, email, department };

    fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to add user.");
        return response.json();
    })
    .then(() => {
        addUserToTable(newUser);
        userFormContainer.style.display = "none";
        userForm.reset();
    })
    .catch(error => {
        console.error("Error adding user:", error);
        alert("Error adding user. Please try again.");
    });
}

// Function to add a new user to the table
function addUserToTable(user) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name.split(" ")[0]}</td>
        <td>${user.name.split(" ")[1] || ""}</td>
        <td>${user.email}</td>
        <td>${user.department}</td>
        <td>
            <button class="edit-btn" data-id="${user.id}">Edit</button>
            <button class="delete-btn" data-id="${user.id}">Delete</button>
        </td>
    `;
    userTableBody.appendChild(row);
}

// Function to handle editing a user
function editUser(userId) {
    console.log("Editing user with ID:", userId);

    const row = [...document.querySelectorAll("tr")].find(tr =>
        tr.querySelector(".edit-btn")?.getAttribute("data-id") === userId
    );

    if (!row) {
        alert("User not found!");
        return;
    }

    document.getElementById("userId").value = row.cells[0].innerText;
    document.getElementById("firstName").value = row.cells[1].innerText;
    document.getElementById("lastName").value = row.cells[2].innerText;
    document.getElementById("email").value = row.cells[3].innerText;
    document.getElementById("department").value = row.cells[4].innerText;

    document.getElementById("formTitle").innerText = "Edit User";
    userFormContainer.classList.remove("hidden");
    userFormContainer.style.display = "block";
    userFormContainer.scrollIntoView({ behavior: "smooth", block: "center" });

    // Remove any previous event listener and assign a new one
    userForm.removeEventListener("submit", updateUserHandler); 
    userForm.onsubmit = (event) => updateUserHandler(event, userId);
}

function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return;// Alert message
    }

    // Find the row in the table
    const row = [...document.querySelectorAll("tr")].find(tr =>
        tr.querySelector(".delete-btn")?.getAttribute("data-id") === userId
    );

    if (row) {
        row.remove(); // Remove row from table
    }

    // Simulate API DELETE request
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete user.");
        }
        console.log(`User with ID ${userId} deleted.`);
    })
    .catch(error => {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
    });
}

// Function to update a user
function updateUserHandler(event, userId) {
    event.preventDefault();

    const row = [...document.querySelectorAll("tr")].find(tr =>
        tr.querySelector(".edit-btn")?.getAttribute("data-id") === userId
    );

    row.cells[1].innerText = document.getElementById("firstName").value;
    row.cells[2].innerText = document.getElementById("lastName").value;
    row.cells[3].innerText = document.getElementById("email").value;
    row.cells[4].innerText = document.getElementById("department").value;

    userFormContainer.style.display = "none";
    userForm.reset();

    userForm.removeEventListener("submit", updateUserHandler);
    userForm.addEventListener("submit", handleAddUser);
}

// Load users when the page loads
document.addEventListener("DOMContentLoaded", fetchUsers);
