import json
import os

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from dicedine.utils.logger import MainLogger
from dicedine.utils.singleton import Singleton

logger = MainLogger.get_logger()


class SecretsManager(metaclass=Singleton):
    secret_name = "prod/dicedine/websecrets"
    region_name = "us-west-2"

    def __init__(self):
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=self.region_name
        )
        self.secret = {}
        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=self.secret_name)
            self.secret = json.loads(get_secret_value_response['SecretString'])
            self._export_secrets_to_env_vars()
        except (BotoCoreError, ClientError) as e:
            logger.error(f"Failed to retrieve secrets from AWS:\n{e}")

    def _export_secrets_to_env_vars(self):
        for k, v in self.secret.items():
            os.environ[k] = v

    def get_openai_api_key(self):
        return self.secret['OPENAI_API_KEY']

    def get_google_oauth_client_secret(self):
        return self.secret['GOOGLE_OAUTH_CLIENT_SECRET']

    def get_google_oauth_client_id(self):
        return self.secret['GOOGLE_OAUTH_CLIENT_ID']
