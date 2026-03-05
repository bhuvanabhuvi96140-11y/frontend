const API_BASE_URL = 'http://127.0.0.1:5000/api';
document.addEventListener('DOMContentLoaded', () => {
    const studentGrid = document.getElementById('student-grid');
    if (studentGrid) {
        fetchStudents();
    }
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Login successful');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: ' + data.error);
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Registration successful');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed: ' + data.error);
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    const editForm = document.getElementById('edit-form');
    if (editForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('id');

        if (studentId) {
            document.getElementById('form-title').innerText = 'Edit Student';
            fetch(`${API_BASE_URL}/students/${studentId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        document.getElementById('student-name').value = data.name;
                        document.getElementById('student-email').value = data.email;
                        document.getElementById('student-course').value = data.course;
                    }
                });
        } else {
            document.getElementById('form-title').innerText = 'Add Student';
        }

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('student-name').value;
            const email = document.getElementById('student-email').value;
            const course = document.getElementById('student-course').value;

            const method = studentId ? 'PUT' : 'POST';
            const url = studentId ? `${API_BASE_URL}/students/${studentId}` : `${API_BASE_URL}/students`;

            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, course })
                });
                if (res.ok) {
                    alert('Student saved successfully');
                    window.location.href = 'index.html';
                } else {
                    const data = await res.json();
                    alert('Failed to save: ' + (data.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! student form will be submitted successfully.');
            contactForm.reset();
        });
    }
});
async function fetchStudents() {
    const studentGrid = document.getElementById('student-grid');
    studentGrid.innerHTML = '<p class="text-center">Loading students...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        studentGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1;">
                <p>Could not connect to the backend.</p>
                <p class="text-sm">Make sure your Flask server is running at ${API_BASE_URL}</p>
                <button onclick="fetchStudents()" class="btn-small mt-4">Retry</button>
            </div>
        `;
    }
}
function renderStudents(students) {
    const studentGrid = document.getElementById('student-grid');
    studentGrid.innerHTML = '';
    if (students.length === 0) {
        studentGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">No students found.</p>';
        return;
    }
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <h3>${student.name}</h3>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <div class="card-actions">
                <a href="edit.html?id=${student.id}" class="btn-small">Edit</a>
                <button onclick="deleteStudent(${student.id})" class="btn-small danger">Delete</button>
            </div>
        `;
        studentGrid.appendChild(card);
    });
}
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
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
}