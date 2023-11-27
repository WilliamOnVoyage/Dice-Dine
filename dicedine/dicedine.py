import streamlit as st
import folium
from streamlit_folium import st_folium


def get_bot_response(user_input):
    # TODO: Dummy response
    return "Dicer: I got you!"


# Main App
def main():
    st.title("Dice & Dine")
    m = folium.Map(location=(37.77, -122.47), tiles="cartodb positron")
    # Show maps
    st_folium(m, width=725)

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
        bot_response = get_bot_response(user_input)
        st.session_state.conversation.append(bot_response)

    # Display conversation
    for message in st.session_state.conversation:
        st.text(message)


# Main App
if __name__ == "__main__":
    main()
