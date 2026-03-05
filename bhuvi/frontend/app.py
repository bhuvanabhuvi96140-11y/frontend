from flask import Flask, jsonify, request, render_template
import sqlite3
import os
app = Flask(__name__, static_folder='static', static_url_path='', template_folder='templates')
app.secret_key = "secret123"
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
def get_db():
    return sqlite3.connect(DB_PATH)
def init_db():
    con = get_db()
    cur = con.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT)
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        course TEXT,
        phone TEXT)
    """)
    con.commit()
    con.close()

init_db()
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<page>.html')
def serve_pages(page):
    return render_template(f"{page}.html")
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    con = get_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE username = ?", (email,))
    if cur.fetchone():
        con.close()
        return jsonify({"error": "User already exists"}), 400
        
    cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (email, password))
    con.commit()
    con.close()
    return jsonify({"message": "Registration successful"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    con = get_db()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE username = ? AND password = ?", (email, password))
    user = cur.fetchone()
    con.close()
    
    if user:
        return jsonify({"message": "Login successful", "user": {"id": user['id'], "email": user['username']}}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/students', methods=['GET'])
def get_students():
    con = get_db()
    con.row_factory = sqlite3.Row 
    cur = con.cursor()
    cur.execute("SELECT * FROM students")
    rows = cur.fetchall()
    con.close()
    students = [dict(row) for row in rows]
    return jsonify(students)
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    course = data.get('course')
    if not name or not course:
        return jsonify({"error": "Name and course are required"}), 400
    con = get_db()
    cur = con.cursor()
    cur.execute("INSERT INTO students (name, email, course) VALUES (?, ?, ?)", (name, email, course))
    con.commit()
    new_id = cur.lastrowid
    con.close()
    return jsonify({"id": new_id, "name": name, "email": email, "course": course}), 201

@app.route('/api/students/<int:id>', methods=['GET'])
def get_student(id):
    con = get_db()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM students WHERE id = ?", (id,))
    row = cur.fetchone()
    con.close()
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "Student not found"}), 404

@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    name = data.get('name')
    email = data.get('email')
    course = data.get('course')
    con = get_db()
    cur = con.cursor()
    cur.execute("UPDATE students SET name=?, email=?, course=? WHERE id=?", (name, email, course, id))
    con.commit()
    con.close()
    return jsonify({"message": "Student updated successfully"})

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    con = get_db()
    cur = con.cursor()
    cur.execute("DELETE FROM students WHERE id = ?", (id,))
    con.commit()
    con.close()
    return jsonify({"message": "Student deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)