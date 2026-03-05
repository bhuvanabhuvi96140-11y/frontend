from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3
import os
app = Flask(__name__)
app.secret_key = "secret123"
def get_db():
    return sqlite3.connect("database.db")
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
        course TEXT,
        phone TEXT)
    """)
    con.commit()
    con.close()
init_db()
@app.route("/", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        con = get_db()
        cur = con.cursor()
        cur.execute("INSERT INTO users(username,password) VALUES (?,?)",
                    (username, password))
        con.commit()
        con.close()
        return redirect(url_for("login"))
    return render_template("registration.html")
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        con = get_db()
        cur = con.cursor()
        cur.execute("SELECT * FROM users WHERE username=? AND password=?",
                    (username, password))
        user = cur.fetchone()
        con.close()
        if user:
            session["user"] = username
            return redirect(url_for("dashboard"))
        else:
            return "Invalid Username or Password"
    return render_template("login.html")
@app.route("/dashboard")
def dashboard():
    if "user" in session:
        return render_template("dashboard.html")
    return redirect(url_for("login"))
@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))
@app.route("/add", methods=["GET", "POST"])
def add_student():
    if request.method == "POST":
        name = request.form["name"]
        course = request.form["course"]
        phone = request.form["phone"]
        con = get_db()
        cur = con.cursor()
        cur.execute("INSERT INTO students(name,course,phone) VALUES (?,?,?)",
                    (name, course, phone))
        con.commit()
        con.close()
        return redirect(url_for("view_students"))
    return render_template("add_std.html")
@app.route("/view")
def view_students():
    con = get_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM students")
    students = cur.fetchall()
    con.close()
    return render_template("view_std.html", students=students)
@app.route("/edit/<int:id>", methods=["GET", "POST"])
def edit_student(id):
    con = get_db()
    cur = con.cursor()
    if request.method == "POST":
        name = request.form["name"]
        course = request.form["course"]
        phone = request.form["phone"]
        cur.execute("""
        UPDATE students
        SET name=?, course=?, phone=?
        WHERE id=?
        """, (name, course, phone, id))
        con.commit()
        con.close()
        return redirect(url_for("view_students"))
    cur.execute("SELECT * FROM students WHERE id=?", (id,))
    student = cur.fetchone()
    con.close()
    return render_template("edit_std.html", student=student)
@app.route("/delete/<int:id>")
def delete_student(id):
    con = get_db()
    cur = con.cursor()
    cur.execute("DELETE FROM students WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect(url_for("view_students"))
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)