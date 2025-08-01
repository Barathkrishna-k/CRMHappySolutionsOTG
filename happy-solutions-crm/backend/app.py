from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from config import Config

from routes.auth import auth_bp
from routes.leads import leads_bp
from routes.quote import quote_bp
from routes.payments import payments_bp
from routes.dashboard import dashboard_bp
from routes.followup import followup_bp

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET
CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_ORIGIN}}, supports_credentials=True)

mongo_client = MongoClient(Config.MONGO_URI)
db = mongo_client[Config.MONGO_DB]
app.config["DB"] = db

jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(leads_bp, url_prefix="/api/leads")
app.register_blueprint(quote_bp, url_prefix="/api/quote")
app.register_blueprint(payments_bp, url_prefix="/api/payments")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(followup_bp, url_prefix="/api/followup")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)

from models.user import create_user

@app.route("/api/seed")
def seed_users():
    db = app.config["DB"]
    create_user(db, "master@happy.com", "admin123", "MASTER", "Happy Master")
    create_user(db, "admin1@happy.com", "admin123", "ADMIN", "Admin One")
    create_user(db, "admin2@happy.com", "admin123", "ADMIN", "Admin Two")
    create_user(db, "user1@happy.com", "admin123", "USER", "User One")
    return {"status": "seeded"}, 200