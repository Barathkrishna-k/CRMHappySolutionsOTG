from datetime import datetime

def customers_collection(db):
    return db["customers"]

def upsert_customer(db, payload):
    col = customers_collection(db)
    existing = col.find_one({"phone": payload.get("phone")})
    doc = {
        "name": payload.get("name"),
        "phone": payload.get("phone"),
        "email": payload.get("email"),
        "address": payload.get("address"),
        "business_type": payload.get("business_type"),
        "shipping_needs": payload.get("shipping_needs"),
        "created_at": existing.get("created_at") if existing else datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    if existing:
        col.update_one({"_id": existing["_id"]}, {"$set": doc})
        return existing["_id"]
    else:
        res = col.insert_one(doc)
        return res.inserted_id
