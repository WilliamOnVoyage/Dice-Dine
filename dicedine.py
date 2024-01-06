import streamlit as st

from dicedine.backend.auth import create_authenticator
from dicedine.backend.gpt import (DiceDineGPT, parse_bot_response, parse_bot_response_address,
                                  parse_bot_recommendations, bot_has_recommendations)
from dicedine.utils.logger import MainLogger

gpt_client = DiceDineGPT()

logger = MainLogger.get_logger()


def get_bot_response(user_input):
    ret = gpt_client.recommendation_assistant(user_input)
    return ret.choices[0].message.content


def authorized_user_functions():
    # Conversation state
    if 'conversation' not in st.session_state:
        st.session_state.conversation = []

    # User input
    user_input = st.chat_input("You: ", key="user_input")

    # Handling user input
    if user_input:
        with st.status("Dicing your choice ..."):
            st.session_state.conversation.clear()
            # Add user input to conversation
            st.session_state.conversation.append(f"You: {user_input}")

            # Get bot response and add to conversation
            response_text = get_bot_response(user_input)
            logger.info(f"Returned text: {response_text}")

        if bot_has_recommendations(response_text):
            st.session_state.conversation.append(f"Dice: {parse_bot_recommendations(response_text)}")
            address_df = parse_bot_response_address(response_text)
            st.map(address_df)
        else:
            st.session_state.conversation.append(f"Dice: {parse_bot_response(response_text)}")

    # Display conversation
    with st.chat_message("Assistant"):
        for message in st.session_state.conversation:
            st.write(message)


# Main App
def main():
    st.set_page_config(page_title="Dice & Dine", page_icon="./resources/logo.png")
    col1, col2 = st.columns(2)
    col1.title("Dice & Dine")
    col2.image("./resources/logo.png", use_column_width="always")
    authenticator = create_authenticator()
    name, authentication_status, _ = authenticator.login('Login', 'sidebar')
    if authentication_status:
        with col1:
            st.header(f'Welcome {name}', divider='red')
            authenticator.logout('Logout', 'main')
        authorized_user_functions()
    elif authentication_status is False:
        with col1:
            st.error('Username/password is incorrect')
    elif authentication_status is None:
        with col1:
            st.warning('Please enter your username and password')


# Main App
if __name__ == "__main__":
    main()
