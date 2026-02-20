import os

from flask import Flask, render_template, session, request, jsonify

from dicedine import auth

app = Flask(__name__)
app.secret_key = os.urandom(12)

app.register_blueprint(auth.bp)


@app.route('/')
def index():
    return render_template('index.html', user_authenticated=is_user_authenticated(),
                           user_name=get_user_name())


@app.route('/chat', methods=['POST'])
def chat():
    message = request.form['message']
    app.logger.info(f"Message: {message}")
    session['message'].append(message)
    return jsonify({}), 200


@app.route('/get_messages')
def get_messages():
    return jsonify(session['message'])


def is_user_authenticated():
    try:
        return session['authenticated']
    except KeyError:
        return False


def get_user_name():
    try:
        return session['user']
    except KeyError:
        return None


if __name__ == "__main__":
    app.run(debug=True)
