import bcrypt
from datetime import datetime

def users_collection(db):
    return db["users"]

def create_user(db, email, password, role, name=""):
    col = users_collection(db)
    if col.find_one({"email": email}):
        return
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    col.insert_one({
        "email": email,
        "password": pw_hash,
        "role": role,
        "name": name,
        "created_at": datetime.utcnow()
    })

def verify_user(db, email, password):
    col = users_collection(db)
    user = col.find_one({"email": email})
    if not user:
        return None
    if bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return user
    return None
