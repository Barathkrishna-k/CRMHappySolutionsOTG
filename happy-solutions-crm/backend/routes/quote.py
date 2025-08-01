from flask import Blueprint, request, jsonify
from models.quote import compute_quote

quote_bp = Blueprint("quote", __name__)

@quote_bp.post("/calculate")
def calculate():
    payload = request.get_json() or {}
    result = compute_quote(payload)
    return jsonify(result), 200
