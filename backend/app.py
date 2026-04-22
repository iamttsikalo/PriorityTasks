import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Task, User 
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Варіант, який дозволяє все і не конфліктує з credentials
CORS(app, resources={r"/*": {"origins": "*"}})
# Налаштування підключення до бази (Render Postgres)
db_url = os.getenv('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Автоматичне створення таблиць при запуску
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Backend is running! API ready for requests."

# --- РОБОТА ІЗ ЗАВДАННЯМИ (ПЕРСОНАЛІЗОВАНО) ---

# Отримати завдання тільки для конкретного юзера
@app.route('/api/tasks/<int:user_id>', methods=['GET'])
def get_user_tasks(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([task.to_dict() for task in tasks])

# Додати завдання (фронтенд має передати user_id)
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    title = data.get('title')
    user_id = data.get('user_id')
    
    if not title or not user_id:
        return jsonify({"error": "Назва та ID користувача обов'язкові"}), 400

    try:
        new_task = Task(
            title=title,
            urgency=data.get('urgency', 1),
            importance=data.get('importance', 1),
            user_id=user_id
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- РЕЄСТРАЦІЯ ТА ВХІД ---

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Всі поля обов'язкові"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Користувач уже існує"}), 400

    try:
        new_user = User(
            username=username,
            email=email,
            password_hash=password 
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Реєстрація успішна!", "user_id": new_user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    
    if user and user.password_hash == password:
        return jsonify({
            "message": "Вхід успішний!", 
            "user_id": user.id,
            "username": user.username
        }), 200
    
    return jsonify({"error": "Невірний логін або пароль"}), 401

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error:": "Завдання не знайдено"}), 404
    
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Завдання успішно видалено"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)