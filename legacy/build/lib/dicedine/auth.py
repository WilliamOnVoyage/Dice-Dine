from authlib.common.security import generate_token
from authlib.integrations.flask_client import OAuth
from flask import url_for, redirect, session, Blueprint

bp = Blueprint('auth', __name__, url_prefix='/auth')
# Replace these with your own Google OAuth credentials
GOOGLE_OAUTH_CLIENT_ID = "845260438793-j4e8etj23508f2a6qjhijuajurnoqarq.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET = "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"
CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
oauth = OAuth(bp)


@bp.route('/google')
def google():
    oauth.register(
        name='google',
        client_id=GOOGLE_OAUTH_CLIENT_ID,
        client_secret=GOOGLE_OAUTH_CLIENT_SECRET,
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    # Redirect to google_auth function
    redirect_uri = url_for('auth.google.authorized', _external=True)
    session['nonce'] = generate_token()
    return oauth.google.authorize_redirect(redirect_uri, nonce=session['nonce'])


@bp.route('/google/authorized')
def google_auth():
    token = oauth.google.authorize_access_token()
    user = oauth.google.parse_id_token(token, nonce=session['nonce'])["name"]
    session['user'] = user
    session['authenticated'] = True
    session['message'] = []
    return redirect('/chat')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))
