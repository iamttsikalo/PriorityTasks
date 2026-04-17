from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

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