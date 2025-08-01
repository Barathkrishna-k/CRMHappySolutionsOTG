from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from datetime import timedelta
from models.user import verify_user, create_user, users_collection

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = verify_user(db, email, password)
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401
    token = create_access_token(identity=user["email"], additional_claims={"role": user["role"]}, expires_delta=timedelta(hours=12))
    return jsonify({"token": token, "role": user["role"], "email": user["email"], "name": user.get("name","")})

@auth_bp.post("/users")
def create_user_route():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    requester_role = (data.get("requester_role") or "").upper()
    if requester_role not in {"MASTER","ADMIN"}:
        return jsonify({"message": "Forbidden"}), 403
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or "admin123"
    role = (data.get("role") or "USER").upper()
    name = data.get("name") or ""
    create_user(db, email, password, role, name)
    return jsonify({"message": "User created"}), 201

@auth_bp.get("/users")
def list_users():
    db = current_app.config["DB"]
    col = users_collection(db)
    users = list(col.find({}, {"password":0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return jsonify(users), 200
