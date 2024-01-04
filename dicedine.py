import json

import streamlit as st

from dicedine.backend.gpt import DiceDineGPT
from dicedine.backend.map import get_map_df
from dicedine.utils.logger import MainLogger
from dicedine.backend.auth import create_authenticator

gpt_client = DiceDineGPT()

logger = MainLogger.get_logger()


def get_bot_response(user_input):
    ret = gpt_client.recommendation_assistant(user_input)
    return ret.choices[0].message.content


def parse_bot_response_address(response_text):
    addresses = []
    ret_json = json.loads(response_text)["Recommended Restaurants"]
    for _, item in enumerate(ret_json):
        addresses.append(item["Address"])

    return addresses


def authorized_user_functions():
    # Conversation state
    if 'conversation' not in st.session_state:
        st.session_state.conversation = []

    # User input
    user_input = st.chat_input("You: ", key="user_input")

    # Handling user input
    if user_input:
        # Add user input to conversation
        st.session_state.conversation.append("You: " + user_input)

        # Get bot response and add to conversation
        response_text = get_bot_response(user_input)
        logger.info(f"Returned text: {response_text}")
        st.session_state.conversation.append(response_text)

        address_df = parse_bot_response_address(response_text)
        st.map(get_map_df(address_df))

    # Display conversation
    for message in st.session_state.conversation:
        st.text(message)


# Main App
def main():
    st.title("Dice & Dine")
    authenticator = create_authenticator()
    name, authentication_status, _ = authenticator.login('Login', 'sidebar')
    if authentication_status:
        authenticator.logout('Logout', 'main')
        st.write(f'Welcome {name}')
        authorized_user_functions()
    elif authentication_status is False:
        st.error('Username/password is incorrect')
    elif authentication_status is None:
        st.warning('Please enter your username and password')


# Main App
if __name__ == "__main__":
    main()
