from pymongo import MongoClient
from config import Config
from models.user import create_user

if __name__ == "__main__":
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.MONGO_DB]
    create_user(db, "master@happy.com", "admin123", "MASTER", name="Happy Master")
    create_user(db, "admin1@happy.com", "admin123", "ADMIN", name="Admin One")
    create_user(db, "admin2@happy.com", "admin123", "ADMIN", name="Admin Two")
    create_user(db, "user1@happy.com", "admin123", "USER", name="User One")
    print("Seed complete. Users created.")
