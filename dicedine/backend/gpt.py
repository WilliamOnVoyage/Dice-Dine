import json

from openai import OpenAI

from dicedine.backend.map import get_map_df
from dicedine.utils.logger import MainLogger

SYSTEM_CONTENT = """
You are an assistant helping the users find the best restaurants that suit their needs.
You do not need to access the latest data, just provide based on whatever you already know.

Ask for preference when the user did not mention any,
and make sure you know the location information before making the recommendation.

Your response should have the following sections, and make sure the section name is following my format:

## Summary: short summary of overall recommendations in the area
## Recommended Restaurants: A list of recommended restaurants with reasons, provide a rating if there is any.
Make sure to append the address at the end of each item.
## Ask: Ask whether the user would like to refine the results or provide more input

Also, wrap up the response in JSON format.
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


def parse_bot_response_address(response_text):
    addresses = []
    ret_json = json.loads(response_text)["Recommended Restaurants"]
    for _, item in enumerate(ret_json):
        addresses.append(item["Address"])

    return get_map_df(addresses)


def parse_bot_response_to_text(response_text):
    ret_json = json.loads(response_text)
    ret = ""
    ret += ret_json["Summary"]
    ret += "\n"
    for rec in ret_json["Recommended Restaurants"]:
        ret += str(rec)
        ret += "\n"
    ret += ret_json["Ask"]
    return ret


if __name__ == "__main__":
    DiceDineGPT().recommendation_assistant("Show me recommendation near San Francisco, no preference")
