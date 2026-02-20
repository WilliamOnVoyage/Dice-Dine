import os
import unittest
from pathlib import Path

from dicedine.backend.auth import create_authenticator, hash_password


class AuthTestCase(unittest.TestCase):
    def test_create_authenticator(self):
        path = os.path.join(Path(__file__).parent.parent, "resources/test_auth.yaml")
        authenticator = create_authenticator(path)
        self.assertIsNotNone(authenticator)

    def test_hash_password(self):
        pws = ["abc", "def"]
        self.assertNotEquals(hash_password(pws), pws)
