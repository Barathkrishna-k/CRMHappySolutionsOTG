import React, { useState } from "react";
import api from "../api";

export default function NewQuote() {
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const [distanceKm, setDistanceKm] = useState("");
    const [truckSize, setTruckSize] = useState("");
    const [typeOfHouse, setTypeOfHouse] = useState("");
    const [packingHours, setPackingHours] = useState("");
    const [packingRate, setPackingRate] = useState(""); // New state for packing rate
    const [weightKg, setWeightKg] = useState("");
    const [tollFee, setTollFee] = useState("");
    const [labourHours, setLabourHours] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    const initialInventoryItems = Array(7).fill({ name: "", qty: "", unit_price: "" });
    const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);

    const [quoteResult, setQuoteResult] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const addInventoryItem = () => {
        setInventoryItems([...inventoryItems, { name: "", qty: "", unit_price: "" }]);
    };

    const handleInventoryChange = (index, field, value) => {
        const newItems = [...inventoryItems];
        newItems[index][field] = value;
        setInventoryItems(newItems);
    };

    const calculateQuote = async () => {
        setMessage("");
        setError("");
        setQuoteResult(null);

        try {
            const payload = {
                distance_km: parseFloat(distanceKm),
                truck_size: truckSize,
                packing_hours: parseFloat(packingHours),
                packing_rate: parseFloat(packingRate), // Include packing_rate in payload
                weight_kg: parseFloat(weightKg),
                toll_fee: parseFloat(tollFee),
                labour_hours: parseFloat(labourHours),
                type_of_house: typeOfHouse,
                inventory_items: inventoryItems.filter(item => item.name && item.qty && item.unit_price)
            };
            const { data } = await api.post("/quote/calculate", payload);
            setQuoteResult(data);
        } catch (err) {
            setError(err?.response?.data?.message || "Error calculating quote.");
        }
    };

    const saveLead = async () => {
        setMessage("");
        setError("");
        try {
            const payload = {
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                    address: customerAddress,
                },
                details: {
                    from_location: fromLocation,
                    to_location: toLocation,
                    distance_km: parseFloat(distanceKm),
                    truck_size: truckSize,
                    type_of_house: typeOfHouse,
                    packing_hours: parseFloat(packingHours),
                    packing_rate: parseFloat(packingRate), // Include packing_rate in details
                    weight_kg: parseFloat(weightKg),
                    toll_fee: parseFloat(tollFee),
                    labour_hours: parseFloat(labourHours),
                    inventory_items: inventoryItems.filter(item => item.name && item.qty && item.unit_price)
                },
                quote_input: { // This object will be used by the backend to re-compute the quote for saving
                    distance_km: parseFloat(distanceKm),
                    truck_size: truckSize,
                    packing_hours: parseFloat(packingHours),
                    packing_rate: parseFloat(packingRate), // Include packing_rate in quote_input
                    weight_kg: parseFloat(weightKg),
                    toll_fee: parseFloat(tollFee),
                    labour_hours: parseFloat(labourHours),
                    type_of_house: typeOfHouse,
                    inventory_items: inventoryItems.filter(item => item.name && item.qty && item.unit_price)
                },
                assigned_to_user_email: assignedTo,
                follow_up_at: followUpDate || null,
                status: "NEW"
            };
            await api.post("/leads", payload);
            setMessage("Lead saved successfully!");
            // Optionally, clear form or redirect
        } catch (err) {
            setError(err?.response?.data?.message || "Error saving lead.");
        }
    };

    return (
        <div className="container">
            <h2 className="header">New Quote</h2>

            <div className="card grid grid-2" style={{ marginBottom: 20 }}>
                <div>
                    <label className="label">Customer Name</label>
                    <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div>
                    <label className="label">Customer Email</label>
                    <input className="input" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
                <div>
                    <label className="label">Customer Phone</label>
                    <input className="input" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                </div>
                <div>
                    <label className="label">Customer Address</label>
                    <input className="input" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
                </div>
            </div>

            <div className="card grid grid-2" style={{ marginBottom: 20 }}>
                <div>
                    <label className="label">From Location</label>
                    <input className="input" value={fromLocation} onChange={e => setFromLocation(e.target.value)} />
                </div>
                <div>
                    <label className="label">To Location</label>
                    <input className="input" value={toLocation} onChange={e => setToLocation(e.target.value)} />
                </div>
                <div>
                    <label className="label">Distance (KM)</label>
                    <input className="input" type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} />
                </div>
                <div>
                    <label className="label">Truck Size</label>
                    <select className="input" value={truckSize} onChange={e => setTruckSize(e.target.value)}>
                        <option value="">Select Truck Size</option>
                        <option value="4T">4T</option>
                        <option value="6T">6T</option>
                        <option value="8T">8T</option>
                        <option value="10T">10T</option>
                        <option value="12T">12T</option>
                        <option value="14T">14T</option>
                        <option value="18T">18T</option>
                    </select>
                </div>
                <div>
                    <label className="label">Type of House</label>
                    <select className="input" value={typeOfHouse} onChange={e => setTypeOfHouse(e.target.value)}>
                        <option value="">Select Type</option>
                        <option value="Studio">Studio</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="5 BHK">5 BHK</option>
                        <option value="6 BHK">6 BHK</option>
                    </select>
                </div>
                <div>
                    <label className="label">No. of Packing Hours</label>
                    <input className="input" type="number" value={packingHours} onChange={e => setPackingHours(e.target.value)} />
                </div>
                <div>
                    <label className="label">Packing Rate ($)</label> {/* New dropdown */}
                    <select className="input" value={packingRate} onChange={e => setPackingRate(e.target.value)}>
                        <option value="">Select Rate</option>
                        <option value="80">80</option>
                        <option value="100">100</option>
                        <option value="120">120</option>
                        <option value="60">60</option>
                    </select>
                </div>
                <div>
                    <label className="label">Weight of Stuffs (KG)</label>
                    <input className="input" type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
                </div>
                <div>
                    <label className="label">Toll Fee</label>
                    <input className="input" type="number" value={tollFee} onChange={e => setTollFee(e.target.value)} />
                </div>
                <div>
                    <label className="label">Loading and Unloading Hours (Labour Hours)</label>
                    <input className="input" type="number" value={labourHours} onChange={e => setLabourHours(e.target.value)} />
                </div>
                <div>
                    <label className="label">Assigned To (User Email)</label>
                    <input className="input" type="email" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                </div>
                <div>
                    <label className="label">Follow-up Date (YYYY-MM-DD)</label>
                    <input className="input" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0 }}>Inventory Items</h3>
                {inventoryItems.map((item, index) => (
                    <div key={index} className="grid grid-3" style={{ marginBottom: 10 }}>
                        <input className="input" placeholder="Item Name" value={item.name} onChange={e => handleInventoryChange(index, "name", e.target.value)} />
                        <input className="input" type="number" placeholder="Quantity" value={item.qty} onChange={e => handleInventoryChange(index, "qty", e.target.value)} />
                        <input className="input" type="number" placeholder="Unit Price" value={item.unit_price} onChange={e => handleInventoryChange(index, "unit_price", e.target.value)} />
                    </div>
                ))}
                <button className="btn secondary" onClick={addInventoryItem}>Add Item</button>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button className="btn" onClick={calculateQuote}>Calculate Quote</button>
                <button className="btn secondary" onClick={saveLead}>Save Lead</button>
            </div>

            {error && <div style={{ color: "#ff3333", marginBottom: 20 }}>{error}</div>}
            {message && <div style={{ color: "green", marginBottom: 20 }}>{message}</div>}

            {quoteResult && (
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Quote Summary (AUD)</h3>
                    <div className="grid grid-2">
                        <p>Truck Charge:</p><p>${quoteResult.charges.truck}</p>
                        <p>Packing Charge:</p><p>${quoteResult.charges.packing}</p>
                        <p>Weight of Stuffs (for Insurance):</p><p>{weightKg} KG</p>
                        <p>Insurance:</p><p>${quoteResult.charges.insurance}</p>
                        <p>Labour Charge:</p><p>${quoteResult.charges.labour}</p>
                        <p>Toll Fee:</p><p>${quoteResult.charges.toll}</p>
                        <p>Inventory Items Total:</p><p>${quoteResult.charges.inventoryTotal}</p>
                        <hr style={{ gridColumn: "1/3" }}/>
                        <p>Subtotal:</p><p>${quoteResult.subtotal}</p>
                        <p>GST (10%):</p><p>${quoteResult.gst}</p>
                        <p><strong>Total:</strong></p><p><strong>${quoteResult.total}</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
}