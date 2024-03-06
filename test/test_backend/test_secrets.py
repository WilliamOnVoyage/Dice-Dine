import unittest

from dicedine.backend.secrets import SecretsManager


class SecretsManagerTestCase(unittest.TestCase):
    def test_fail_safely(self):
        self.assertEquals(SecretsManager().secret, {})
