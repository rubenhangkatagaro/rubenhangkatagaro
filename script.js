
/* =========================================
   CAMPUS ALERT - MAIN JAVASCRIPT
========================================= */

const STORAGE_KEY = "campusAlertReports";
const USERS_KEY = "campusAlertUsers";

/*
  DEMO ONLY:
  Palitan ang invitation code bago gamitin.
  Ang client-side code ay hindi secure para sa
  totoong administrator registration.
*/
const ADMIN_INVITATION_CODE = "CAMPUS-ADMIN-2026";

/* =========================================
   STORAGE
========================================= */

function getReports() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

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

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

/* =========================================
   AUTHENTICATION TABS
========================================= */

function showAuthPage(page) {
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");

    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");

    if (!loginPage || !registerPage) {
        console.error("Login or Register section not found!");
        return;
    }

    if (page === "register") {
        loginPage.classList.add("hidden");
        registerPage.classList.remove("hidden");

        loginTab.classList.remove("active");
        registerTab.classList.add("active");
    } else {
        loginPage.classList.remove("hidden");
        registerPage.classList.add("hidden");

        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    }
}

document.getElementById("goRegister")?.addEventListener("click", function(e) {
    e.preventDefault();
    showAuthPage("register");
});

document.getElementById("goLogin")?.addEventListener("click", function(e) {
    e.preventDefault();
    showAuthPage("login");
});
/* =========================================
   REGISTRATION ROLE
========================================= */

const registerRole = document.getElementById("registerRole");

function changeRegistrationForm() {
    if (!registerRole) return;

    const isStudent = registerRole.value === "student";

    document.getElementById("studentRegisterForm")
        ?.classList.toggle("hidden", !isStudent);

    document.getElementById("adminRegisterForm")
        ?.classList.toggle("hidden", isStudent);
}

registerRole?.addEventListener("change", changeRegistrationForm);
changeRegistrationForm();

/* =========================================
   REGISTRATION VALIDATION
========================================= */

function emailExists(email) {
    return getUsers().some(user => user.email === email.toLowerCase());
}

function idExists(field, value) {
    return getUsers().some(user => user[field] === value);
}

function passwordsMatch(password, confirm) {
    if (password !== confirm) {
        alert("Passwords do not match!");
        return false;
    }

    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return false;
    }

    return true;
}

/* =========================================
   STUDENT REGISTRATION
========================================= */

document.getElementById("studentRegisterForm")
    ?.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("regStudentName").value.trim();
    const studentId = document.getElementById("regStudentId").value.trim();
    const course = document.getElementById("regCourse").value;
    const year = document.getElementById("regYear").value;
    const section = document.getElementById("regSection").value.trim();
    const email = document.getElementById("regStudentEmail").value.trim().toLowerCase();
    const password = document.getElementById("regStudentPassword").value;
    const confirm = document.getElementById("regStudentConfirm").value;

    if (!passwordsMatch(password, confirm)) return;

    if (emailExists(email)) {
        alert("This email is already registered.");
        return;
    }

    if (idExists("studentId", studentId)) {
        alert("This Student ID is already registered.");
        return;
    }

    const user = {
        role: "student",
        name,
        studentId,
        course,
        year,
        section,
        email,
        password
    };

    const users = getUsers();
    users.push(user);

    try {
        saveUsers(users);
    } catch {
        alert("Unable to save account. Please try again.");
        return;
    }

    alert("Student registration successful! You can now login.");

    event.target.reset();

    document.getElementById("role").value = "student";
    document.getElementById("loginEmail").value = email;

    showAuthPage("login");
});

/* =========================================
   ADMIN REGISTRATION
========================================= */

document.getElementById("adminRegisterForm")
    ?.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("regAdminName").value.trim();
    const employeeId = document.getElementById("regEmployeeId").value.trim();
    const department = document.getElementById("regDepartment").value;
    const position = document.getElementById("regPosition").value.trim();
    const email = document.getElementById("regAdminEmail").value.trim().toLowerCase();
    const code = document.getElementById("regAdminCode").value;
    const password = document.getElementById("regAdminPassword").value;
    const confirm = document.getElementById("regAdminConfirm").value;

    if (!passwordsMatch(password, confirm)) return;

    if (code !== ADMIN_INVITATION_CODE) {
        alert("Invalid administrator invitation code.");
        return;
    }

    if (emailExists(email)) {
        alert("This email is already registered.");
        return;
    }

    if (idExists("employeeId", employeeId)) {
        alert("This Employee ID is already registered.");
        return;
    }

    const user = {
        role: "admin",
        name,
        employeeId,
        department,
        position,
        email,
        password
    };

    const users = getUsers();
    users.push(user);

    try {
        saveUsers(users);
    } catch {
        alert("Unable to save administrator account.");
        return;
    }

    alert("Administrator registration successful! You can now login.");

    event.target.reset();

    document.getElementById("role").value = "admin";
    document.getElementById("loginEmail").value = email;

    showAuthPage("login");
});

/* =========================================
   LOGIN
========================================= */

document.getElementById("loginForm")
    ?.addEventListener("submit", event => {

    event.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    let account = getUsers().find(user =>
        user.email === email &&
        user.password === password &&
        user.role === role
    );

    // Original demo admin account is retained.
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
            employeeId: "DEMO-ADMIN",
            department: "School Administration",
            position: "Administrator"
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
        sessionStorage.setItem("campusDepartment", account.department || "");
        sessionStorage.setItem("campusPosition", account.position || "");

        window.location.href = "admin-dashboard.html";
    }
});

/* =========================================
   PAGE ACCESS CHECK
========================================= */

const page = document.body.dataset.page;
const userRole = sessionStorage.getItem("campusRole");

if (page === "student" && userRole !== "student") {
    window.location.replace("index.html");
}

if (page === "admin" && userRole !== "admin") {
    window.location.replace("index.html");
}

/* =========================================
   LOGOUT
========================================= */

document.getElementById("logoutButton")?.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});

/* =========================================
   STUDENT DETAILS
========================================= */

const studentName = sessionStorage.getItem("campusName") || "Student";
const studentId = sessionStorage.getItem("campusStudentId") || "";

if (page === "student") {
    document.getElementById("studentTopName").textContent = studentName;
    document.getElementById("profileName").textContent = studentName;

    document.getElementById("profileId").textContent =
        "Student ID: " + studentId;
}

/* =========================================
   NAVIGATION
========================================= */

function openSection(name) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(name + "Section")?.classList.remove("hidden");

    document.querySelectorAll(".nav-btn[data-section]").forEach(button => {
        button.classList.toggle("active", button.dataset.section === name);
    });

    const title = document.getElementById(
        page === "student" ? "studentPageTitle" : "adminPageTitle"
    );

    if (title) {
        const titles = {
            dashboard: page === "student" ? "Student Dashboard" : "Admin Dashboard",
            report: "Report Problem Room",
            myreports: "My Reports",
            profile: "My Profile",
            reports: "Manage Reports"
        };

        title.textContent = titles[name] || "Dashboard";
    }

    refreshPage();
}

document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => openSection(button.dataset.section));
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => openSection(button.dataset.go));
});

/* =========================================
   STUDENT REPORTS
========================================= */

function studentReports() {
    return getReports().filter(report => report.studentId === studentId);
}

/* =========================================
   PHOTO PREVIEW
========================================= */

let selectedImage = "";

const photoInput = document.getElementById("reportPhoto");

if (photoInput) {
    photoInput.addEventListener("change", function() {
        const file = this.files[0];
        const preview = document.getElementById("imagePreview");

        selectedImage = "";
        preview.style.display = "none";

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            alert("Please select a JPG, PNG, or WEBP image.");
            this.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("The image must be 1 MB or smaller.");
            this.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {
            selectedImage = event.target.result;
            preview.src = selectedImage;
            preview.style.display = "block";
        };

        reader.readAsDataURL(file);
    });
}

/* =========================================
   SUBMIT REPORT
========================================= */

document.getElementById("reportForm")?.addEventListener("submit", event => {
    event.preventDefault();

    if (!selectedImage) {
        alert("Please upload a photo.");
        return;
    }

    const report = {
        id: "CA-" + Date.now(),
        studentName,
        studentId,
        category: document.getElementById("category").value,
        urgency: document.getElementById("urgency").value,
        building: document.getElementById("building").value.trim(),
        room: document.getElementById("room").value.trim(),
        description: document.getElementById("description").value.trim(),
        photo: selectedImage,
        status: "Pending",
        date: new Date().toLocaleString(),
        rejectionReason: ""
    };

    const reports = getReports();
    reports.unshift(report);

    try {
        saveReports(reports);
    } catch {
        alert("Unable to save this report. Try a smaller photo.");
        return;
    }

    alert("Report submitted successfully!\nReference ID: " + report.id);

    event.target.reset();
    selectedImage = "";
    document.getElementById("imagePreview").style.display = "none";

    openSection("myreports");
});

/* =========================================
   STATUS CLASS
========================================= */

function statusClass(status) {
    return status.replaceAll(" ", "-");
}

/* =========================================
   REPORT DISPLAY
========================================= */

function reportCard(report, isAdmin = false) {
    const adminControls = isAdmin ? `
        <label><strong>Update Status:</strong></label>

        <select class="status-select"
            onchange="updateStatus('${report.id}', this.value)">

            ${["Pending", "Under Review", "In Progress", "Resolved", "Rejected"]
                .map(option => `
                    <option value="${option}"
                        ${report.status === option ? "selected" : ""}>
                        ${option}
                    </option>
                `).join("")}

        </select>
    ` : "";

    const rejection = report.rejectionReason
        ? `<p><strong>Admin Note:</strong> ${safe(report.rejectionReason)}</p>`
        : "";

    return `
        <article class="report-item">

            <img class="report-photo"
                 src="${report.photo}"
                 alt="Reported problem">

            <div class="report-info">

                <h3>${safe(report.category)}</h3>

                <p><strong>Reference:</strong> ${safe(report.id)}</p>
                <p><strong>Student:</strong> ${safe(report.studentName)}</p>
                <p><strong>Student ID:</strong> ${safe(report.studentId)}</p>
                <p><strong>Location:</strong> ${safe(report.building)}, ${safe(report.room)}</p>
                <p><strong>Urgency:</strong> ${safe(report.urgency)}</p>
                <p><strong>Description:</strong> ${safe(report.description)}</p>
                <p><strong>Date:</strong> ${safe(report.date)}</p>

                <span class="status ${statusClass(report.status)}">
                    ${safe(report.status)}
                </span>

                ${rejection}
                ${adminControls}

            </div>
        </article>
    `;
}

/* =========================================
   STUDENT DASHBOARD
========================================= */

function renderStudent() {
    const reports = studentReports();

    document.getElementById("studentTotal").textContent = reports.length;

    document.getElementById("studentPending").textContent =
        reports.filter(r => r.status === "Pending").length;

    document.getElementById("studentProgress").textContent =
        reports.filter(r => r.status === "In Progress").length;

    document.getElementById("studentResolved").textContent =
        reports.filter(r => r.status === "Resolved").length;

    document.getElementById("studentRecentReports").innerHTML =
        reports.length
            ? reports.slice(0, 5).map(r => reportCard(r)).join("")
            : `<div class="empty"><span>📭</span>No reports submitted yet.</div>`;

    document.getElementById("myReportsList").innerHTML =
        reports.length
            ? reports.map(r => reportCard(r)).join("")
            : `<div class="empty"><span>📭</span>You have no reports yet.</div>`;
}

/* =========================================
   ADMIN DASHBOARD
========================================= */

function renderAdmin() {
    const reports = getReports();

    document.getElementById("adminTotal").textContent = reports.length;

    document.getElementById("adminPending").textContent =
        reports.filter(r => r.status === "Pending").length;

    document.getElementById("adminProgress").textContent =
        reports.filter(r => r.status === "In Progress").length;

    document.getElementById("adminResolved").textContent =
        reports.filter(r => r.status === "Resolved").length;

    document.getElementById("adminRecentReports").innerHTML =
        reports.length
            ? reports.slice(0, 5).map(r => reportCard(r, true)).join("")
            : `<div class="empty"><span>📭</span>No student reports yet.</div>`;

    renderAdminReports();
}

/* =========================================
   ADMIN MANAGE REPORTS
========================================= */

function renderAdminReports() {
    const container = document.getElementById("adminAllReports");

    if (!container) return;

    const filter = document.getElementById("statusFilter")?.value || "All";

    let reports = getReports();

    if (filter !== "All") {
        reports = reports.filter(r => r.status === filter);
    }

    container.innerHTML = reports.length
        ? reports.map(r => reportCard(r, true)).join("")
        : `<div class="empty"><span>📭</span>No reports found.</div>`;
}

/* =========================================
   ADMIN UPDATE STATUS
========================================= */

function updateStatus(reportId, newStatus) {
    const reports = getReports();
    const report = reports.find(r => r.id === reportId);

    if (!report) {
        alert("Report not found.");
        return;
    }

    if (newStatus === "Rejected") {
        const reason = prompt("Enter the reason for rejecting this report:");

        if (!reason || !reason.trim()) {
            alert("A rejection reason is required.");
            refreshPage();
            return;
        }

        report.rejectionReason = reason.trim();
    } else {
        report.rejectionReason = "";
    }

    report.status = newStatus;

    try {
        saveReports(reports);
        alert("Report status updated.");
    } catch {
        alert("Unable to save the status update.");
    }

    refreshPage();
}

/* =========================================
   FILTER
========================================= */

document.getElementById("statusFilter")
    ?.addEventListener("change", renderAdminReports);

/* =========================================
   REFRESH
========================================= */

function refreshPage() {
    if (page === "student") renderStudent();
    if (page === "admin") renderAdmin();
}

if (page === "student" || page === "admin") {
    refreshPage();
}
