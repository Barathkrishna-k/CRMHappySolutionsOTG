import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from datetime import datetime

def generate_invoice_pdf(inv):
    """
    inv = {
      "invoice_number", "date", "customer": {"name","email","phone","address"},
      "items": [{"name","qty","amount"}],
      "charges": {"truck","packing","weight","insurance","labour","toll","inventoryTotal"},
      "subtotal", "gst", "total", "lead_id"
    }
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    x_margin = 20 * mm
    y = height - 25 * mm

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x_margin, y, "Happy Solutions - Tax Invoice")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, f"Invoice #: {inv.get('invoice_number','')}")
    y -= 5 * mm
    c.drawString(x_margin, y, f"Date: {inv.get('date', datetime.utcnow().strftime('%Y-%m-%d'))}")

    # Customer
    y -= 12 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y, "Bill To")
    c.setFont("Helvetica", 10)
    y -= 5 * mm
    cust = inv.get("customer", {})
    c.drawString(x_margin, y, f"{cust.get('name','')}")
    y -= 5 * mm
    c.drawString(x_margin, y, f"{cust.get('email','')} | {cust.get('phone','')}")
    y -= 5 * mm
    c.drawString(x_margin, y, f"{cust.get('address','')}")
    y -= 10 * mm

    # Line items (summary)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y, "Charges Summary (AUD)")
    y -= 6 * mm
    c.setFont("Helvetica", 10)

    charges = inv.get("charges", {})
    lines = [
        ("Truck Charge", charges.get("truck", 0)),
        ("Packing Charge", charges.get("packing", 0)),
        ("Weight Charge", charges.get("weight", 0)),
        ("Insurance", charges.get("insurance", 0)),
        ("Labour", charges.get("labour", 0)),
        ("Toll Fee", charges.get("toll", 0)),
        ("Inventory Items", charges.get("inventoryTotal", 0)),
    ]
    for name, amt in lines:
        c.drawString(x_margin, y, name)
        c.drawRightString(width - x_margin, y, f"{amt:,.2f}")
        y -= 5 * mm

    y -= 5 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x_margin, y, "Subtotal")
    c.drawRightString(width - x_margin, y, f"{inv.get('subtotal',0):,.2f}")
    y -= 5 * mm
    c.drawString(x_margin, y, "GST (10%)")
    c.drawRightString(width - x_margin, y, f"{inv.get('gst',0):,.2f}")
    y -= 5 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y, "Total")
    c.drawRightString(width - x_margin, y, f"{inv.get('total',0):,.2f}")

    y -= 15 * mm
    c.setFont("Helvetica", 9)
    c.drawString(x_margin, y, f"Lead/Job ID: {inv.get('lead_id','')}")
    y -= 5 * mm
    c.drawString(x_margin, y, "Thank you for choosing Happy Solutions!")

    c.showPage()
    c.save()
    pdf = buf.getvalue()
    buf.close()
    return pdf
