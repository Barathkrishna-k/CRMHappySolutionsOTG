from flask import Blueprint, request, jsonify, current_app, send_file
from bson import ObjectId
from datetime import datetime
from models.lead import create_lead, list_leads, get_lead, update_lead
from models.customer import upsert_customer
from models.quote import compute_quote
from models.invoice import create_invoice, get_invoice_by_lead
from utils.pdf import generate_invoice_pdf
from utils.validators import is_object_id
import io

leads_bp = Blueprint("leads", __name__)

@leads_bp.post("")
def create_new_lead():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    customer_payload = data.get("customer") or {}
    customer_id = upsert_customer(db, customer_payload)
    quote_payload = data.get("quote_input") or {}
    quote = compute_quote(quote_payload)
    lead_doc = {
        "customer_id": str(customer_id),
        "status": data.get("status", "NEW"),
        "assigned_to_user_email": data.get("assigned_to_user_email"),
        "details": data.get("details") or {},
        "quote": quote,
        "payment_link": None,
        "follow_up_at": data.get("follow_up_at"),
        "feedback": "",
    }
    lead_id = create_lead(db, lead_doc)
    return jsonify({"lead_id": str(lead_id), "quote": quote}), 201

@leads_bp.get("")
def list_all():
    db = current_app.config["DB"]
    status = request.args.get("status")
    leads = list_leads(db, status=status)
    for l in leads:
        l["_id"] = str(l["_id"])
    return jsonify(leads), 200

@leads_bp.get("/<lead_id>")
def get_one(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    doc = get_lead(db, lead_id)
    if not doc:
        return jsonify({"message": "Not found"}), 404
    doc["_id"] = str(doc["_id"])
    return jsonify(doc), 200

@leads_bp.patch("/<lead_id>")
def patch_lead(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    updates = request.get_json() or {}
    update_lead(db, lead_id, updates)
    return jsonify({"message": "Updated"}), 200

@leads_bp.post("/<lead_id>/invoice")
def create_invoice_for_lead(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    lead = get_lead(db, lead_id)
    if not lead:
        return jsonify({"message": "Lead not found"}), 404
    cust = lead.get("details", {}).get("customer") or {}
    invoice_doc = {
        "lead_id": lead_id,
        "invoice_number": f"INV-{lead_id[-6:]}",
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "customer": {
            "name": cust.get("name", ""),
            "email": cust.get("email", ""),
            "phone": cust.get("phone", ""),
            "address": cust.get("address", ""),
        },
        "items": [],
        "charges": lead.get("quote", {}).get("charges", {}),
        "subtotal": lead.get("quote", {}).get("subtotal", 0),
        "gst": lead.get("quote", {}).get("gst", 0),
        "total": lead.get("quote", {}).get("total", 0),
    }
    inv_id = create_invoice(db, invoice_doc)
    return jsonify({"invoice_id": str(inv_id)}), 201

@leads_bp.get("/<lead_id>/invoice.pdf")
def download_invoice_pdf(lead_id):
    db = current_app.config["DB"]
    if not is_object_id(lead_id):
        return jsonify({"message": "Invalid ID"}), 400
    inv = get_invoice_by_lead(db, lead_id)
    if not inv:
        return jsonify({"message": "Invoice not found"}), 404
    pdf_bytes = generate_invoice_pdf({
        "invoice_number": inv.get("invoice_number"),
        "date": inv.get("date"),
        "customer": inv.get("customer"),
        "charges": inv.get("charges"),
        "subtotal": inv.get("subtotal"),
        "gst": inv.get("gst"),
        "total": inv.get("total"),
        "lead_id": lead_id
    })
    return send_file(io.BytesIO(pdf_bytes), as_attachment=True, download_name=f"{inv.get('invoice_number','invoice')}.pdf", mimetype="application/pdf")
