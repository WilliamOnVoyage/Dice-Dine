import os
from glob import glob

from setuptools import find_packages, setup


def find_scripts():
    """
    Return the scripts to be published

    :return: list of script file relative paths
    """
    scripts = []
    script_dirs = ["bin"]
    for script_dir in script_dirs:
        for script_file in glob(os.path.join(script_dir, "*")):
            scripts.append(script_file)
    return scripts


def find_data_files():
    # Copy data and configuration files
    data_files = []
    for root, dirs, files in os.walk('data'):
        data_files.append((os.path.relpath(root),
                           [os.path.join(root, f) for f in files]))
    for root, dirs, files in os.walk('configuration'):
        data_files.append((os.path.relpath(root),
                           [os.path.join(root, f) for f in files]))
    return data_files


args = dict(
    name="Dice & Dine",
    version="0.0.1",
    author="Alice & Will",
    description="Let GPT be your local foodie guide!",
    packages=find_packages(),
    data_files=find_data_files(),
    include_package_data=True,
    scripts=find_scripts(),
)

setup(**args)
