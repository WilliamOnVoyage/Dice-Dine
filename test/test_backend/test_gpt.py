import unittest
import json
from dicedine.backend.gpt import DiceDineGPT


class DiceDineGPTTestCase(unittest.TestCase):
    def test_recommendation(self):
        ret = DiceDineGPT().recommendation_assistant("Show me recommendation near San Francisco, no preference")
        self.assertIsNotNone(ret)
        input_str = ret.choices[0].message.content
        ret_json = json.loads(input_str)
        self.assertTrue("Summary" in ret_json.keys())
        self.assertTrue("Recommended Restaurants" in ret_json.keys())
