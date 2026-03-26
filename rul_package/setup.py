from setuptools import setup, find_packages

setup(
    name="nvidia-e2cc-twin",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "numpy",
        "pandas",
        "schedule",
        "scikit-learn",
        "joblib",
        "influxdb3-python"
    ],
    entry_points={
        "console_scripts": [
            "e2cc-start=nvidia_twin.cli:main",
        ],
    },
)
