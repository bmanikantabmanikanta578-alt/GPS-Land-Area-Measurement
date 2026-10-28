from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime


db = SQLAlchemy()


class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(100), unique=True)

    email = db.Column(db.String(100), unique=True)

    password = db.Column(db.String(200))


class Measurement(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer)

    measurement_name = db.Column(db.String(200))

    area = db.Column(db.String(100))

    perimeter = db.Column(db.String(100))

    coordinates = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)