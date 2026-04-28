""""
Database configuration
"""

from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.getcwd(), '.env'))

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["eccomerce_db"]

#collections
users_collection = db["users"]
products_collection = db["products"]
orders_collection = db["orders"]
cart_collection = db["cart"]
