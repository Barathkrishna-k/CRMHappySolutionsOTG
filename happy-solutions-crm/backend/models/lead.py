from datetime import datetime
from bson import ObjectId

def leads_collection(db):
    return db["leads"]

def create_lead(db, data):
    col = leads_collection(db)
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    res = col.insert_one(data)
    return res.inserted_id

def update_lead(db, lead_id, updates):
    col = leads_collection(db)
    col.update_one({"_id": ObjectId(lead_id)}, {"$set": {**updates, "updated_at": datetime.utcnow()}})

def get_lead(db, lead_id):
    col = leads_collection(db)
    return col.find_one({"_id": ObjectId(lead_id)})

def list_leads(db, status=None):
    col = leads_collection(db)
    q = {}
    if status:
        q["status"] = status
    return list(col.find(q).sort("created_at", -1))
