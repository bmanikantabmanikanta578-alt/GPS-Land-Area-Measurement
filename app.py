import os

from flask import Flask, render_template
from flask import request, redirect, flash

from flask_login import LoginManager
from flask_login import login_user
from flask_login import logout_user
from flask_login import login_required
from flask_login import current_user

from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from models import db, User, Measurement

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret123'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

app.config['UPLOAD_FOLDER'] = 'static/uploads'


# Initialize Database
db.init_app(app)


# Login Manager
login_manager = LoginManager()

login_manager.init_app(app)

login_manager.login_view = 'login'


# Load User
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Home Page
@app.route('/')
def home():
    return render_template('index.html')


# Register
@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == 'POST':

        username = request.form['username']

        email = request.form['email']

        password = request.form['password']

        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:

            flash('Email already exists')

            return redirect('/register')

        hashed_password = generate_password_hash(password)

        user = User(
            username=username,
            email=email,
            password=hashed_password
        )

        db.session.add(user)

        db.session.commit()

        flash('Registration Successful')

        return redirect('/login')

    return render_template('register.html')


# Login
@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':

        email = request.form['email']

        password = request.form['password']

        user = User.query.filter_by(
            email=email
        ).first()

        if user and check_password_hash(
            user.password,
            password
        ):

            login_user(user)

            flash('Login Successful')

            return redirect('/dashboard')

        flash('Invalid Email or Password')

    return render_template('login.html')


# Dashboard
@app.route('/dashboard')
@login_required
def dashboard():

    measurements = Measurement.query.filter_by(
        user_id=current_user.id
    ).all()

    return render_template(
        'dashboard.html',
        measurements=measurements
    )


# Map Measurement Page
@app.route('/map')
@login_required
def map_measure():

    return render_template('map_measure.html')


# Save Measurement
@app.route('/save_measurement', methods=['POST'])
@login_required
def save_measurement():

    measurement = Measurement(

        user_id=current_user.id,

        measurement_name=request.form['measurement_name'],

        area=request.form['area'],

        perimeter=request.form['perimeter'],

        coordinates=request.form['coordinates']
    )

    db.session.add(measurement)

    db.session.commit()

    flash('Measurement Saved Successfully')

    return redirect('/history')


# History Page
@app.route('/history')
@login_required
def history():

    measurements = Measurement.query.filter_by(
        user_id=current_user.id
    ).all()

    return render_template(
        'history.html',
        measurements=measurements
    )


# Profile Page
@app.route('/profile')
@login_required
def profile():

    return render_template('profile.html')


# Admin Dashboard
@app.route('/admin')
def admin():

    users = User.query.count()

    measurements = Measurement.query.count()

    return render_template(
        'admin.html',
        users=users,
        measurements=measurements
    )

@app.route('/upload', methods=['POST'])
@login_required
def upload():

    file = request.files['image']

    if file:

        filename = secure_filename(file.filename)

        filepath = os.path.join(
            app.config['UPLOAD_FOLDER'],
            filename
        )

        file.save(filepath)

        flash('File Uploaded Successfully')

    return redirect('/profile')


# Logout
@app.route('/logout')
@login_required
def logout():

    logout_user()

    flash('Logged Out Successfully')

    return redirect('/')


# Run Application
if __name__ == '__main__':

    with app.app_context():

        db.create_all()

    app.run(debug=True)