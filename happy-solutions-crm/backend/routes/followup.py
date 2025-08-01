from flask import Blueprint, request, jsonify, current_app
from utils.validators import is_object_id
from models.lead import list_leads, update_lead

followup_bp = Blueprint("followup", __name__)

@followup_bp.get("")
def list_followups():
    db = current_app.config["DB"]
    leads = list_leads(db, status="FOLLOW_UP")
    for l in leads:
        l["_id"] = str(l["_id"])
    return jsonify(leads), 200

@followup_bp.post("/<lead_id>/confirm")
def confirm_lead(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    update_lead(db, lead_id, {"status": "CONFIRMED"})
    return jsonify({"message": "Lead confirmed"}), 200

@followup_bp.post("/<lead_id>/return")
def return_lead(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    data = request.get_json() or {}
    feedback = data.get("feedback", "")
    update_lead(db, lead_id, {"status": "RETURNED", "feedback": feedback})
    return jsonify({"message": "Lead returned"}), 200
