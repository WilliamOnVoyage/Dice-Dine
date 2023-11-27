import numpy as np
import pandas as pd
from geopy.exc import GeopyError
from geopy.geocoders import Nominatim

from dicedine.utils.logger import MainLogger

logger = MainLogger.get_logger()


def geocode_address(address):
    geolocator = Nominatim(user_agent="dice&dine")
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except GeopyError:
        logger.info(f"Unable to geocode address: {address}")
        return None, None


def get_map_df(addresses: list[str]):
    geocodes = []
    for address in addresses:
        geocodes.append(geocode_address(address))

    df = pd.DataFrame(
        np.array(geocodes),
        columns=['lat', 'lon'])
    return df
