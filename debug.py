# debug.py
import sys
sys.path.append("./app")  # add 'app' folder to Python path

from utils import call_gpt_api  # now Python will find utils.py

response = call_gpt_api("Hello AI, how are you today?")
print(response)
