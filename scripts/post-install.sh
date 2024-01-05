cd /home/ubuntu/Dice-Dine || exit

CONDA_PYTHON="/home/ubuntu/miniconda/bin/python"
CONDA_PIP="/home/ubuntu/miniconda/bin/pip"

$CONDA_PIP install -r requirements.txt
$CONDA_PYTHON setup.py build
$CONDA_PYTHON setup.py install

echo Post install finished!