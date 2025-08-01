from flask import Blueprint, request, jsonify, current_app
import requests

payments_bp = Blueprint("payments", __name__)

@payments_bp.post("/create_link")
def create_payment_link():
    db = current_app.config["DB"]
    key_id = current_app.config.get("RAZORPAY_KEY_ID")
    key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        return jsonify({"message": "Razorpay keys not configured"}), 500

    data = request.get_json() or {}
    amount_aud = float(data.get("amount_aud", 0) or 0)
    amount_paise = int(round(amount_aud * 100))  # AUD assumed

    payload = {
        "amount": amount_paise,
        "currency": "INR",  # Change to AUD if Razorpay supports
        "description": data.get("description", "Advance Token"),
        "customer": {
            "name": data.get("customer", {}).get("name", ""),
            "email": data.get("customer", {}).get("email", ""),
            "contact": data.get("customer", {}).get("phone", ""),
        },
        "notify": {"sms": True, "email": True},
        "reminder_enable": True,
        "notes": {"lead_id": data.get("lead_id", "")}
    }

    auth = (key_id, key_secret)
    resp = requests.post("https://api.razorpay.com/v1/payment_links", json=payload, auth=auth, timeout=30)
    if resp.status_code not in (200, 201):
        return jsonify({"message": "Failed to create payment link", "detail": resp.text}), 502

    rj = resp.json()
    db["payments"].insert_one({
        "lead_id": data.get("lead_id", ""),
        "payment_link": rj,
        "amount_aud": amount_aud
    })
    return jsonify({"payment_link": rj}), 201
