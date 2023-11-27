import unittest
import json
from dicedine.backend.gpt import DiceDineGPT
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
