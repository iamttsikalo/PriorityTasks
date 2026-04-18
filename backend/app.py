import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Task
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# Налаштування бази даних
db_url = os.getenv('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Створюємо таблиці, якщо їх немає
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Backend is running! Visit /api/tasks to see your data."

# Отримати всі завдання
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# Додати нове завдання
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    title = data.get('title')
    
    if not title:
        return jsonify({"error": "Назва завдання обов'язкова"}), 400

    try:
        new_task = Task(
            title=title,
            urgency=data.get('urgency', 1),
            importance=data.get('importance', 1)
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Тимчасовий роут для реєстрації (щоб не було 404)
# Видали той роут, що ми додавали раніше, і встав цей:
@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    print(f"Отримано дані для реєстрації: {data}") 
    return jsonify({"message": "Успішно отримано (тестовий режим)"}), 200

# Роут для логіну
@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    print(f"Спроба входу: {data}")
    return jsonify({"message": "Вхід успішний"}), 200
if __name__ == '__main__':
    app.run(debug=True)