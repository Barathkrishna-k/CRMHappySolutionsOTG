from bson import ObjectId

def is_object_id(s: str) -> bool:
    try:
        ObjectId(s)
        return True
    except Exception:
        return False
