const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth State
    const user = JSON.parse(sessionStorage.getItem('user'));
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');

    if (user && navLogin && navRegister && navLogout) {
        navLogin.style.display = 'none';
        navRegister.style.display = 'none';
        navLogout.style.display = 'inline-block';
        navLogout.textContent = `Logout (${user.email})`;
    }

    // 1. Dashboard (index.html)
    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
        fetchStudents();
        addStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const course = document.getElementById('course').value;

            try {
                const res = await fetch(`${BACKEND_URL}/api/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, course })
                });
                if (res.ok) {
                    addStudentForm.reset();
                    fetchStudents();
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to add student');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    // 2. Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${BACKEND_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    // 3. Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    // 4. Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you! Your message has been sent successfully.');
            contactForm.reset();
        });
    }

    // 5. Edit Student Form
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('id');
        if (studentId) {
            loadStudentData(studentId);
        }

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('student-name').value;
            const email = document.getElementById('student-email').value;
            const course = document.getElementById('student-course').value;

            try {
                const res = await fetch(`${BACKEND_URL}/api/students/${studentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, course })
                });
                if (res.ok) {
                    alert('Student updated successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Failed to update student');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }
});

// Function to fetch students for dashboard
async function fetchStudents() {
    const list = document.getElementById('students-list');
    if (!list) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/students`);
        const students = await res.json();

        list.innerHTML = '';
        if (students.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No students found. Add one above!</td></tr>';
            return;
        }

        students.forEach(s => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding: 10px;">${s.id}</td>
                <td style="padding: 10px;">${s.name || '-'}</td>
                <td style="padding: 10px;">${s.email || '-'}</td>
                <td style="padding: 10px;">${s.course || '-'}</td>
                <td style="padding: 10px;">
                    <button onclick="editStudent(${s.id})" class="btn-small" style="background-color: var(--secondary); margin-right: 5px;">Edit</button>
                    <button onclick="deleteStudent(${s.id})" class="btn-small" style="background-color: #EF4444;">Delete</button>
                </td>
            `;
            list.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #EF4444;">Failed to load students. Is the server running?</td></tr>';
    }
}

function editStudent(id) {
    window.location.href = `edit.html?id=${id}`;
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
        const res = await fetch(`${BACKEND_URL}/api/students/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchStudents();
        } else {
            alert('Failed to delete student');
        }
    } catch (err) {
        console.error(err);
        alert('Connection error');
    }
}

async function loadStudentData(id) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/students/${id}`);
        if (res.ok) {
            const student = await res.json();
            document.getElementById('student-name').value = student.name;
            document.getElementById('student-email').value = student.email;
            document.getElementById('student-course').value = student.course;
        } else {
            alert('Student not found');
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error(err);
        alert('Connection error');
    }
}

function logout() {
    sessionStorage.removeItem('user');
    window.location.reload();
}