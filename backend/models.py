from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    tasks = db.relationship('Task', backref='author', lazy=True)

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    urgency = db.Column(db.Integer, default = 1)
    importance = db.Column(db.Integer, default = 1)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'urgency': self.urgency,
            'importance': self.importance,
            'priority': self.urgency * self.importance
        }