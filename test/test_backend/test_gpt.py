import unittest
import json
from dicedine.backend.gpt import DiceDineGPT, bot_has_recommendations, parse_bot_response_address
from unittest.mock import patch, MagicMock


class DiceDineGPTTestCase(unittest.TestCase):
    @patch("openai.resources.chat.completions.Completions.create",
           MagicMock(return_value='{"Summary": "", "Recommended Restaurants": []}'))
    def test_recommendation(self):
        ret = DiceDineGPT().recommendation_assistant("Show me recommendation near San Francisco, no preference")
        self.assertIsNotNone(ret)
        input_str = ret
        ret_json = json.loads(input_str)
        self.assertTrue("Summary" in ret_json.keys())
        self.assertTrue("Recommended Restaurants" in ret_json.keys())

    def test_bot_has_recommendations(self):
        ret_1 = 'This is random results'
        self.assertFalse(bot_has_recommendations(ret_1))
        ret_2 = '{"Summary": "This is partial result"}'
        self.assertFalse(bot_has_recommendations(ret_2))
        ret_3 = '{"Summary": "This is partial result", "Recommended Restaurants":[]}'
        self.assertFalse(bot_has_recommendations(ret_3))
        ret_4 = '{"Summary": "This is partial result", "Ask": "What"}'
        self.assertFalse(bot_has_recommendations(ret_4))

        ret_full = '{"Summary": "This is partial result", "Recommended Restaurants":[], "Ask": "What"}'
        self.assertTrue(bot_has_recommendations(ret_full))

    def test_parse_bot_response_address(self):
        sample_ret = json.dumps({
            "Summary": "Sichuan cuisine is known for its bold flavors.",
            "Recommended Restaurants": [
                {
                    "Name": "Sichuan Impression",
                    "Reason": "Authentic Sichuan dishes with a modern twist.",
                    "Rating": "4.5/5",
                    "Address": "3948 Rivermark Plaza, Santa Clara, CA 95054"
                },
                {
                    "Name": "Chengdu Taste",
                    "Reason": "Offers a variety of traditional Sichuan dishes.",
                    "Rating": "4.2/5",
                    "Address": "19772 Stevens Creek Blvd, Cupertino, CA 95014"
                },
                {
                    "Name": "Little Sichuan",
                    "Reason": "A local favorite for Sichuan hot pots and street food-style dishes.",
                    "Rating": "4.0/5",
                    "Address": "1245 Jacklin Rd, Milpitas, CA 95035"
                }
            ],
            "Ask": "Would you like to refine the results or provide more input?"
        })

        add_df = parse_bot_response_address(sample_ret)
        self.assertEquals(add_df.shape, (3, 2))
