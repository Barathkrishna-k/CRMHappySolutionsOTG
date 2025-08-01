from datetime import datetime
from bson import ObjectId

def invoices_collection(db):
    return db["invoices"]

def create_invoice(db, doc):
    col = invoices_collection(db)
    doc["created_at"] = datetime.utcnow()
    res = col.insert_one(doc)
    return res.inserted_id

def get_invoice(db, invoice_id):
    col = invoices_collection(db)
    return col.find_one({"_id": ObjectId(invoice_id)})

def get_invoice_by_lead(db, lead_id):
    col = invoices_collection(db)
    return col.find_one({"lead_id": lead_id})
