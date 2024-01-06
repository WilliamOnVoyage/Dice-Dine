import json

from openai import OpenAI

from dicedine.backend.map import get_map_df
from dicedine.utils.logger import MainLogger

SYSTEM_CONTENT = """
You are an assistant helping the users find the best restaurants that suit their needs.
You do not need to access the latest data, just provide based on whatever you already know.

Ask for preference when the user did not mention any,
and make sure you know the location information before making the recommendation.

If the user insists on not providing any input, just try your best to make recommendations.

Your response should have the following sections, and make sure the section name is the same as mine:

Summary: Summary of overall recommendations in the area
Recommended Restaurants: A list of recommended restaurants with below sections:
    Name: name of the restaurant
    Reason: reason for making the recommendation
    Rating: user rating
    Address: address of the restaurant
Ask: Ask whether the user would like to refine the results or provide more input

Also, wrap up the response in JSON format.

If you cannot return results in the above format, or Recommended Restaurants has no result, please don't wrap up in JSON
 and output your response in plain text.
"""
logger = MainLogger.get_logger()


class DiceDineGPT(object):
    def __init__(self):
        self.client = OpenAI()

    def recommendation_assistant(self, payload: str):
        logger.info(f"Payload: {payload}")
        completion = self.client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system",
                 "content": SYSTEM_CONTENT},
                {"role": "user", "content": payload}
            ],
            response_format={"type": "json_object"}
        )
        return completion


def bot_has_recommendations(response_text):
    try:
        ret_json = json.loads(response_text)
    except (json.decoder.JSONDecodeError, TypeError):
        return False
    return "Summary" in ret_json.keys() and "Recommended Restaurants" in ret_json.keys() and "Ask" in ret_json.keys()


def parse_bot_response(response_text):
    return response_text


def parse_bot_response_address(response_text):
    addresses = []
    ret_json = json.loads(response_text)["Recommended Restaurants"]
    for _, item in enumerate(ret_json):
        addresses.append(item["Address"])

    return get_map_df(addresses)


def parse_bot_recommendations(response_text):
    ret_json = json.loads(response_text)
    ret = ""
    ret += ret_json["Summary"]
    ret += "  \n"
    for rec in ret_json["Recommended Restaurants"]:
        name, reason, rating, add = rec["Name"], rec["Reason"], rec["Rating"], rec["Address"]
        ret += f"- {name}: {reason}  \n\tRating: {rating}  \n\tAddress: {add}  \n  \n"
    ret += ret_json["Ask"]
    return ret


if __name__ == "__main__":
    DiceDineGPT().recommendation_assistant("Show me recommendation near San Francisco, no preference")
