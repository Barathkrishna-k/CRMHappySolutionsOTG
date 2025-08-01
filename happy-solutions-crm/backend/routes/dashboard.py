from flask import Blueprint, jsonify, current_app
from datetime import datetime, timedelta

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.get("")
def get_dashboard():
    db = current_app.config["DB"]
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    def count_between(col, start):
        return db[col].count_documents({"created_at": {"$gte": start}})

    weekly = {
        "leads": count_between("leads", week_ago),
        "calls": count_between("calls", week_ago),
        "successful_billing": db["invoices"].count_documents({"created_at": {"$gte": week_ago}}),
        "followups": db["leads"].count_documents({"created_at": {"$gte": week_ago}, "status": "FOLLOW_UP"}),
    }
    monthly = {
        "leads": count_between("leads", month_ago),
        "calls": count_between("calls", month_ago),
        "successful_billing": db["invoices"].count_documents({"created_at": {"$gte": month_ago}}),
        "followups": db["leads"].count_documents({"created_at": {"$gte": month_ago}, "status": "FOLLOW_UP"}),
    }
    return jsonify({"weekly": weekly, "monthly": monthly})
