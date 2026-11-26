
const USERS_KEY = "campusAlertUsers";
const ADMIN_CODE = "CAMPUS-ADMIN-2026";

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const forgotPasswordPage = document.getElementById("forgotPasswordPage");

// SWITCH LOGIN, REGISTER AND FORGOT PASSWORD
function showAuthPage(page) {
    loginPage.classList.toggle("hidden", page !== "login");
    registerPage.classList.toggle("hidden", page !== "register");
    forgotPasswordPage.classList.toggle("hidden", page !== "forgot");

    document.getElementById("loginTab").classList.toggle("active", page === "login");
    document.getElementById("registerTab").classList.toggle("active", page === "register");

    document.getElementById("loginTab").style.display =
        page === "forgot" ? "none" : "";

    document.getElementById("registerTab").style.display =
        page === "forgot" ? "none" : "";
}

document.getElementById("loginTab").onclick = () => showAuthPage("login");
document.getElementById("registerTab").onclick = () => showAuthPage("register");

document.getElementById("goRegister").onclick = function(e) {
    e.preventDefault();
    showAuthPage("register");
};

document.getElementById("goLogin").onclick = function(e) {
    e.preventDefault();
    showAuthPage("login");
};

document.getElementById("forgotPasswordLink").onclick = function(e) {
    e.preventDefault();
    showAuthPage("forgot");
};

document.getElementById("backToLogin").onclick = function(e) {
    e.preventDefault();
    showAuthPage("login");
};


// CHANGE REGISTRATION TYPE
const registerRole = document.getElementById("registerRole");

function changeRegisterRole() {
    const isStudent = registerRole.value === "student";

    document.getElementById("studentRegisterForm")
        .classList.toggle("hidden", !isStudent);

    document.getElementById("adminRegisterForm")
        .classList.toggle("hidden", isStudent);
}

registerRole.addEventListener("change", changeRegisterRole);
changeRegisterRole();


// PASSWORD STRENGTH INDICATOR
function getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length === 0) {
        return { level: "", text: "Password strength" };
    }

    if (score <= 2) {
        return { level: "weak", text: "Weak password" };
    }

    if (score <= 3) {
        return { level: "medium", text: "Medium password" };
    }

    return { level: "strong", text: "Strong password" };
}

function setupPasswordStrength(inputId, barId, textId) {
    const input = document.getElementById(inputId);
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);

    input.addEventListener("input", function() {
        const result = getPasswordStrength(input.value);

        bar.className = "strength-fill";

        if (result.level) {
            bar.classList.add(result.level);
        }

        text.textContent = result.text;
    });
}

setupPasswordStrength(
    "regStudentPassword",
    "studentStrengthBar",
    "studentStrengthText"
);

setupPasswordStrength(
    "regAdminPassword",
    "adminStrengthBar",
    "adminStrengthText"
);

setupPasswordStrength(
    "resetNewPassword",
    "resetStrengthBar",
    "resetStrengthText"
);


// PASSWORD CHECK
function checkPassword(password, confirm) {
    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return false;
    }

    if (password !== confirm) {
        alert("Passwords do not match!");
        return false;
    }

    return true;
}

function accountExists(email) {
    return getUsers().some(user => user.email === email.toLowerCase());
}


// STUDENT REGISTRATION
document.getElementById("studentRegisterForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("regStudentName").value.trim();
    const studentId = document.getElementById("regStudentId").value.trim();
    const year = document.getElementById("regYear").value;
    const section = document.getElementById("regSection").value.trim();
    const course = document.getElementById("regCourse").value;
    const email = document.getElementById("regStudentEmail").value.trim().toLowerCase();
    const password = document.getElementById("regStudentPassword").value;
    const confirm = document.getElementById("regStudentConfirm").value;

    if (!/^(21|22|23|26)-[0-9]+$/.test(studentId)) {
        alert("Invalid Student ID! Use 21-, 22-, 23-, or 26- followed by numbers.");
        return;
    }

    if (!checkPassword(password, confirm)) return;

    const users = getUsers();

    if (accountExists(email)) {
        alert("Email is already registered.");
        return;
    }

    if (users.some(user => user.studentId === studentId)) {
        alert("Student ID is already registered.");
        return;
    }

    users.push({
        role: "student",
        name,
        studentId,
        year,
        section,
        course,
        email,
        password
    });

    try {
        saveUsers(users);
    } catch {
        alert("Unable to save registration. Please try again.");
        return;
    }

    alert("Registration successful! You can now login.");

    this.reset();

    document.getElementById("studentStrengthBar").className = "strength-fill";
    document.getElementById("studentStrengthText").textContent = "Password strength";

    document.getElementById("role").value = "student";
    document.getElementById("loginEmail").value = email;

    showAuthPage("login");
});


// ADMIN REGISTRATION
document.getElementById("adminRegisterForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("regAdminName").value.trim();
    const employeeId = document.getElementById("regEmployeeId").value.trim();
    const department = document.getElementById("regDepartment").value;
    const position = document.getElementById("regPosition").value.trim();
    const email = document.getElementById("regAdminEmail").value.trim().toLowerCase();
    const code = document.getElementById("regAdminCode").value;
    const password = document.getElementById("regAdminPassword").value;
    const confirm = document.getElementById("regAdminConfirm").value;

    if (!checkPassword(password, confirm)) return;

    if (code !== ADMIN_CODE) {
        alert("Invalid administrator invitation code.");
        return;
    }

    const users = getUsers();

    if (accountExists(email)) {
        alert("Email is already registered.");
        return;
    }

    if (users.some(user => user.employeeId === employeeId)) {
        alert("Employee ID is already registered.");
        return;
    }

    users.push({
        role: "admin",
        name,
        employeeId,
        department,
        position,
        email,
        password
    });

    try {
        saveUsers(users);
    } catch {
        alert("Unable to save registration.");
        return;
    }

    alert("Administrator registration successful!");

    this.reset();

    document.getElementById("adminStrengthBar").className = "strength-fill";
    document.getElementById("adminStrengthText").textContent = "Password strength";

    document.getElementById("role").value = "admin";
    document.getElementById("loginEmail").value = email;

    showAuthPage("login");
});


// FORGOT PASSWORD
const resetRole = document.getElementById("resetRole");

resetRole.addEventListener("change", function() {
    const isStudent = resetRole.value === "student";

    document.getElementById("resetIdLabel").textContent =
        isStudent ? "Student ID" : "Employee ID";

    document.getElementById("resetIdentity").placeholder =
        isStudent ? "Enter your Student ID" : "Enter your Employee ID";
});

document.getElementById("forgotPasswordForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const role = document.getElementById("resetRole").value;
    const email = document.getElementById("resetEmail").value.trim().toLowerCase();
    const identity = document.getElementById("resetIdentity").value.trim();
    const newPassword = document.getElementById("resetNewPassword").value;
    const confirmPassword = document.getElementById("resetConfirmPassword").value;

    if (!checkPassword(newPassword, confirmPassword)) return;

    const users = getUsers();

    const account = users.find(user =>
        user.role === role &&
        user.email === email &&
        (
            role === "student"
                ? user.studentId === identity
                : user.employeeId === identity
        )
    );

    if (!account) {
        alert("Account details do not match our records.");
        return;
    }

    account.password = newPassword;

    try {
        saveUsers(users);
    } catch {
        alert("Unable to reset password. Please try again.");
        return;
    }

    alert("Password reset successful! You can now login.");

    this.reset();

    document.getElementById("resetStrengthBar").className = "strength-fill";
    document.getElementById("resetStrengthText").textContent = "Password strength";

    document.getElementById("role").value = role;
    document.getElementById("loginEmail").value = email;

    showAuthPage("login");
});


// LOGIN
document.getElementById("loginForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    let account = getUsers().find(user =>
        user.email === email &&
        user.password === password &&
        user.role === role
    );

    // DEMO ADMIN ACCOUNT
    if (
        !account &&
        role === "admin" &&
        email === "admin@campusalert.com" &&
        password === "admin123"
    ) {
        account = {
            role: "admin",
            name: "Administrator",
            email: email,
            employeeId: "DEMO-ADMIN"
        };
    }

    if (!account) {
        alert("Invalid email, password, or account type.");
        return;
    }

    sessionStorage.setItem("campusRole", account.role);
    sessionStorage.setItem("campusName", account.name);
    sessionStorage.setItem("campusEmail", account.email);

    if (account.role === "student") {
        sessionStorage.setItem("campusStudentId", account.studentId);
        sessionStorage.setItem("campusCourse", account.course);
        sessionStorage.setItem("campusYear", account.year);
        sessionStorage.setItem("campusSection", account.section);

        window.location.href = "student-dashboard.html";
    } else {
        sessionStorage.setItem("campusEmployeeId", account.employeeId || "");
        window.location.href = "admin-dashboard.html";
    }
});
