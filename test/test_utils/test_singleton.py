import unittest

from dicedine.utils.singleton import Singleton


class SingletonClass(object, metaclass=Singleton):
    pass


class NonSingletonClass(object):
    pass


class SingletonTestCase(unittest.TestCase):
    def test_singleton_instance(self):
        sin_1 = SingletonClass()
        sin_2 = SingletonClass()
        self.assertEqual(sin_1, sin_2)

        non_sin_1 = NonSingletonClass()
        non_sin_2 = NonSingletonClass()
        self.assertNotEqual(non_sin_1, non_sin_2)
