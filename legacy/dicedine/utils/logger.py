import logging
import logging.config
from importlib.resources import path

import yaml

from dicedine import conf
from dicedine.utils.singleton import Singleton

LOGGER_NAME = "main"


class MainLogger(object, metaclass=Singleton):
    _logger = None
    _logger_name = LOGGER_NAME

    @classmethod
    def get_logger(cls):
        if cls._logger is None:
            cls._logger = cls.generate_logger()
        return cls._logger

    @classmethod
    def generate_logger(cls):
        with path(conf, "logger.yaml") as config_path:
            with open(config_path, "r") as f:
                logging.config.dictConfig(yaml.safe_load(f.read()))
        logger = logging.getLogger(cls._logger_name)
        return logger
