import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader
from pathlib import Path
import os


def create_authenticator(path=os.path.join(Path(__file__).parent.parent.parent, ".streamlit/auth.yaml")):
    config = load_auth_yaml(path)
    authenticator = stauth.Authenticate(
        config['credentials'],
        config['cookie']['name'],
        config['cookie']['key'],
        config['cookie']['expiry_days'],
        config['preauthorized']
    )
    return authenticator


def load_auth_yaml(path):
    with open(path) as file:
        config = yaml.load(file, Loader=SafeLoader)
    return config


def hash_password(password: list[str]):
    hashed_passwords = stauth.Hasher(password).generate()
    return hashed_passwords
