import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Task
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

db_url = os.getenv('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/api/tasks', methods = ['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods = ['POST'])
def add_task():
    data = request.json
    new_task = Task(
        title = data['title'],
        urgency = data.get('urgency', 1),
        importance = data.get('importance', 1)
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@app.route('/')
def home():
    return "Backend is running! Visit /api/tasks to see your data."

if __name__ == '__main__':
    app.run(debug=True)