from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
app = Flask(__name__)
CORS(app)
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
def init_db():
    conn = get_db_connection()
    conn.execute('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)')
    conn.commit()
    conn.close()
init_db()
@app.route('/')
def home():
    return jsonify({"message": "Backend API is running!"})
@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'POST':
        data = request.json
        user_input = data.get("input", "")
        if not user_input:
            return jsonify({"error": "Input cannot be empty"}), 400            
        conn = get_db_connection()
        conn.execute('INSERT INTO items (name) VALUES (?)', (user_input,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Data saved!"}), 201
    else:
        conn = get_db_connection()
        items = conn.execute('SELECT * FROM items').fetchall()
        conn.close()
        return jsonify([dict(ix) for ix in items])
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)