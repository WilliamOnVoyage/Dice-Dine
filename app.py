import functools
import os

from authlib.common.security import generate_token
from authlib.integrations.flask_client import OAuth
from flask import Flask, render_template, request
from flask import url_for, redirect, session

from dicedine.backend.gpt import (DiceDineGPT, parse_bot_response, parse_bot_response_address,
                                  parse_bot_recommendations, bot_has_recommendations)
from dicedine.backend.secrets import SecretsManager

# Get secrets and set as env vars
secrets = SecretsManager()

gpt_client = DiceDineGPT()
app = Flask(__name__, template_folder='./templates')
app.secret_key = os.urandom(12)
app.config["GOOGLE_OAUTH_CLIENT_ID"] = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
app.config["GOOGLE_OAUTH_CLIENT_SECRET"] = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")

oauth = OAuth(app)
CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'


@app.route('/auth/google')
def google():
    oauth.register(
        name='google',
        client_id=app.config["GOOGLE_OAUTH_CLIENT_ID"],
        client_secret=app.config["GOOGLE_OAUTH_CLIENT_SECRET"],
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    # Redirect to google_auth function
    redirect_uri = url_for('google_auth', _external=True)
    session['nonce'] = generate_token()
    return oauth.google.authorize_redirect(redirect_uri, nonce=session['nonce'])


@app.route('/auth/google/authorized')
def google_auth():
    token = oauth.google.authorize_access_token()
    user = oauth.google.parse_id_token(token, nonce=session['nonce'])["name"]
    session['user'] = user
    session['authenticated'] = True
    session['message'] = []
    return redirect('/chat')


@app.route('/auth/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if not is_user_authenticated():
            return redirect(url_for('google'))

        return view(**kwargs)

    return wrapped_view


@app.route('/')
def index():
    return render_template('index.html', user_authenticated=is_user_authenticated(),
                           user_name=get_user_name())


@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html', user_authenticated=is_user_authenticated(),
                           user_name=get_user_name())


@app.route('/get_response')
@login_required
def get_response():
    user_input = request.args.get('msg')
    return chatbot_response(user_input)


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


def chatbot_response(user_input):
    response_text = gpt_client.recommendation_assistant(user_input).choices[0].message.content

    if bot_has_recommendations(response_text):
        ret = parse_bot_recommendations(response_text)
        _ = parse_bot_response_address(response_text)
    else:
        ret = parse_bot_response(response_text)
    return ret


if __name__ == "__main__":
    app.run(debug=True)
