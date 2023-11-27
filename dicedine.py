import json

import streamlit as st

from dicedine.backend.gpt import DiceDineGPT
from dicedine.backend.map import get_map_df

gpt_client = DiceDineGPT()


def get_bot_response(user_input):
    ret = gpt_client.recommendation_assistant(user_input)
    return ret


def parse_bot_response_address(response_text):
    addresses = []
    ret_json = json.loads(response_text)["Recommended Restaurants"]
    for _, item in enumerate(ret_json):
        addresses.append(item["Address"])

    return addresses


# Main App
def main():
    st.title("Dice & Dine")
    # m = folium.Map(location=(37.77, -122.47), tiles="cartodb positron")
    # # Show maps
    # st_folium(m, width=725)

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
        ret = get_bot_response(user_input)
        response_text = ret.choices[0].message.content
        st.session_state.conversation.append(response_text)

        address_df = parse_bot_response_address(response_text)
        st.map(get_map_df(address_df))

    # Display conversation
    for message in st.session_state.conversation:
        st.text(message)


# Main App
if __name__ == "__main__":
    main()
