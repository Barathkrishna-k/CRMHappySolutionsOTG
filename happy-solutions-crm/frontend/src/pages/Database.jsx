import React, { useEffect, useState } from "react";
import api from "../api";

export default function Database() {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const role = localStorage.getItem("role"); // Get user role for edit permissions

    const fetchLeads = async () => {
        try {
            const { data } = await api.get("/leads");
            setLeads(data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch leads.");
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeadDetails = async (leadId) => {
        setMessage("");
        setError("");
        try {
            const { data } = await api.get(`/leads/${leadId}`);
            setSelectedLead(data);
            setEditData({ // Populate edit form with current data
                customer: data.customer || {},
                details: data.details || {},
                quote: data.quote || {},
                assigned_to_user_email: data.assigned_to_user_email || "",
                follow_up_at: data.follow_up_at || "",
                feedback: data.feedback || "",
                status: data.status || "NEW"
            });
            setIsEditing(false); // Reset editing mode
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch lead details.");
            setSelectedLead(null);
        }
    };

    const handleEditChange = (path, value) => {
        setEditData(prev => {
            const newData = { ...prev };
            let current = newData;
            const parts = path.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newData;
        });
    };

    const handleInventoryEditChange = (index, field, value) => {
        setEditData(prev => {
            const newDetails = { ...prev.details };
            const newInventory = [...(newDetails.inventory_items || [])];
            if (!newInventory[index]) {
                newInventory[index] = { name: "", qty: "", unit_price: "" };
            }
            newInventory[index][field] = value;
            newDetails.inventory_items = newInventory;
            return { ...prev, details: newDetails };
        });
    };

    const addEditableInventoryItem = () => {
        setEditData(prev => {
            const newDetails = { ...prev.details };
            const newInventory = [...(newDetails.inventory_items || [])];
            newInventory.push({ name: "", qty: "", unit_price: "" });
            newDetails.inventory_items = newInventory;
            return { ...prev, details: newDetails };
        });
    };

    const saveEditedLead = async () => {
        setMessage("");
        setError("");
        try {
            // Re-compute quote on backend to ensure consistency if any quote-related inputs changed
            const quoteInputForRecalculation = {
                distance_km: parseFloat(editData.details.distance_km || 0),
                truck_size: editData.details.truck_size,
                packing_hours: parseFloat(editData.details.packing_hours || 0),
                packing_rate: parseFloat(editData.details.packing_rate || 0), // Include packing_rate
                weight_kg: parseFloat(editData.details.weight_kg || 0),
                toll_fee: parseFloat(editData.details.toll_fee || 0),
                labour_hours: parseFloat(editData.details.labour_hours || 0),
                type_of_house: editData.details.type_of_house,
                inventory_items: editData.details.inventory_items.filter(item => item.name && item.qty && item.unit_price)
            };
            const { data: recalculatedQuote } = await api.post("/quote/calculate", quoteInputForRecalculation);

            const updates = {
                customer: editData.customer,
                details: editData.details,
                quote: recalculatedQuote, // Use the re-calculated quote
                assigned_to_user_email: editData.assigned_to_user_email,
                follow_up_at: editData.follow_up_at,
                feedback: editData.feedback,
                status: editData.status
            };
            await api.patch(`/leads/${selectedLead._id}`, updates);
            setMessage("Lead updated successfully!");
            setIsEditing(false);
            fetchLeads(); // Refresh leads list
            fetchLeadDetails(selectedLead._id); // Refresh selected lead details
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to save changes.");
        }
    };

    const canEdit = role === "MASTER" || role === "ADMIN"; // Only Master/Admin can edit

    return (
        <div className="container">
            <h2 className="header">All Leads</h2>

            {error && <div style={{ color: "#ff3333", marginBottom: 20 }}>{error}</div>}
            {message && <div style={{ color: "green", marginBottom: 20 }}>{message}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                <div>
                    <h3>Leads List</h3>
                    <div className="card" style={{ maxHeight: "600px", overflowY: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead._id}>
                                        <td>{lead.details?.customer_name || lead.customer?.name || "N/A"}</td>
                                        <td>{lead.status}</td>
                                        <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn secondary" onClick={() => fetchLeadDetails(lead._id)}>View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    {selectedLead ? (
                        <div className="card">
                            <div className="header">
                                <h3>Lead Details: {selectedLead._id}</h3>
                                {canEdit && (
                                    <button className="btn" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? "Cancel Edit" : "Edit Lead"}
                                    </button>
                                )}
                            </div>

                            {!isEditing ? (
                                <div>
                                    <h4>Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedLead.customer?.name}</p>
                                    <p><strong>Email:</strong> {selectedLead.customer?.email}</p>
                                    <p><strong>Phone:</strong> {selectedLead.customer?.phone}</p>
                                    <p><strong>Address:</strong> {selectedLead.customer?.address}</p>

                                    <h4>Moving Details</h4>
                                    <p><strong>From:</strong> {selectedLead.details?.from_location}</p>
                                    <p><strong>To:</strong> {selectedLead.details?.to_location}</p>
                                    <p><strong>Distance (KM):</strong> {selectedLead.details?.distance_km}</p>
                                    <p><strong>Truck Size:</strong> {selectedLead.details?.truck_size}</p>
                                    <p><strong>Type of House:</strong> {selectedLead.details?.type_of_house}</p>
                                    <p><strong>Packing Hours:</strong> {selectedLead.details?.packing_hours}</p>
                                    <p><strong>Packing Rate:</strong> ${selectedLead.details?.packing_rate}</p> {/* Display packing_rate */}
                                    <p><strong>Weight (KG):</strong> {selectedLead.details?.weight_kg}</p>
                                    <p><strong>Toll Fee:</strong> {selectedLead.details?.toll_fee}</p>
                                    <p><strong>Labour Hours:</strong> {selectedLead.details?.labour_hours}</p>

                                    <h4>Inventory Items</h4>
                                    {selectedLead.details?.inventory_items && selectedLead.details.inventory_items.length > 0 ? (
                                        <ul>
                                            {selectedLead.details.inventory_items.map((item, index) => (
                                                <li key={index}>{item.name} - {item.qty} x ${item.unit_price}</li>
                                            ))}
                                        </ul>
                                    ) : <p>No inventory items listed.</p>}

                                    <h4>Calculated Quote (AUD)</h4>
                                    {selectedLead.quote ? (
                                        <div>
                                            <p><strong>Truck Charge:</strong> ${selectedLead.quote.charges?.truck}</p>
                                            <p><strong>Packing Charge:</strong> ${selectedLead.quote.charges?.packing}</p>
                                            <p><strong>Weight Charge (for Insurance):</strong> ${selectedLead.quote.charges?.weight}</p>
                                            <p><strong>Insurance:</strong> ${selectedLead.quote.charges?.insurance}</p>
                                            <p><strong>Labour Charge:</strong> ${selectedLead.quote.charges?.labour}</p>
                                            <p><strong>Toll Fee:</strong> ${selectedLead.quote.charges?.toll}</p>
                                            <p><strong>Inventory Total:</strong> ${selectedLead.quote.charges?.inventoryTotal}</p>
                                            <p><strong>Subtotal:</strong> ${selectedLead.quote.subtotal}</p>
                                            <p><strong>GST (10%):</strong> ${selectedLead.quote.gst}</p>
                                            <p><strong>Total:</strong> ${selectedLead.quote.total}</p>
                                        </div>
                                    ) : <p>No quote available.</p>}

                                    <h4>Other Details</h4>
                                    <p><strong>Status:</strong> {selectedLead.status}</p>
                                    <p><strong>Assigned To:</strong> {selectedLead.assigned_to_user_email}</p>
                                    <p><strong>Follow-up Date:</strong> {selectedLead.follow_up_at}</p>
                                    <p><strong>Feedback:</strong> {selectedLead.feedback}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedLead.created_at).toLocaleString()}</p>
                                    <p><strong>Last Updated:</strong> {new Date(selectedLead.updated_at).toLocaleString()}</p>
                                </div>
                            ) : (
                                <div>
                                    <h4>Edit Customer Information</h4>
                                    <div className="grid grid-2">
                                        <div>
                                            <label className="label">Name</label>
                                            <input className="input" value={editData.customer?.name || ""} onChange={e => handleEditChange("customer.name", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input className="input" type="email" value={editData.customer?.email || ""} onChange={e => handleEditChange("customer.email", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Phone</label>
                                            <input className="input" type="tel" value={editData.customer?.phone || ""} onChange={e => handleEditChange("customer.phone", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Address</label>
                                            <input className="input" value={editData.customer?.address || ""} onChange={e => handleEditChange("customer.address", e.target.value)} />
                                        </div>
                                    </div>

                                    <h4>Edit Moving Details</h4>
                                    <div className="grid grid-2">
                                        <div>
                                            <label className="label">From Location</label>
                                            <input className="input" value={editData.details?.from_location || ""} onChange={e => handleEditChange("details.from_location", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">To Location</label>
                                            <input className="input" value={editData.details?.to_location || ""} onChange={e => handleEditChange("details.to_location", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Distance (KM)</label>
                                            <input className="input" type="number" value={editData.details?.distance_km || ""} onChange={e => handleEditChange("details.distance_km", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Truck Size</label>
                                            <select className="input" value={editData.details?.truck_size || ""} onChange={e => handleEditChange("details.truck_size", e.target.value)}>
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
                                            <select className="input" value={editData.details?.type_of_house || ""} onChange={e => handleEditChange("details.type_of_house", e.target.value)}>
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
                                            <input className="input" type="number" value={editData.details?.packing_hours || ""} onChange={e => handleEditChange("details.packing_hours", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Packing Rate ($)</label> {/* Editable packing_rate */}
                                            <select className="input" value={editData.details?.packing_rate || ""} onChange={e => handleEditChange("details.packing_rate", e.target.value)}>
                                                <option value="">Select Rate</option>
                                                <option value="80">80</option>
                                                <option value="100">100</option>
                                                <option value="120">120</option>
                                                <option value="60">60</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Weight of Stuffs (KG)</label>
                                            <input className="input" type="number" value={editData.details?.weight_kg || ""} onChange={e => handleEditChange("details.weight_kg", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Toll Fee</label>
                                            <input className="input" type="number" value={editData.details?.toll_fee || ""} onChange={e => handleEditChange("details.toll_fee", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Loading and Unloading Hours (Labour Hours)</label>
                                            <input className="input" type="number" value={editData.details?.labour_hours || ""} onChange={e => handleEditChange("details.labour_hours", e.target.value)} />
                                        </div>
                                    </div>

                                    <h4>Edit Inventory Items</h4>
                                    {editData.details?.inventory_items && editData.details.inventory_items.map((item, index) => (
                                        <div key={index} className="grid grid-3" style={{ marginBottom: 10 }}>
                                            <input className="input" placeholder="Item Name" value={item.name} onChange={e => handleInventoryEditChange(index, "name", e.target.value)} />
                                            <input className="input" type="number" placeholder="Quantity" value={item.qty} onChange={e => handleInventoryEditChange(index, "qty", e.target.value)} />
                                            <input className="input" type="number" placeholder="Unit Price" value={item.unit_price} onChange={e => handleInventoryEditChange(index, "unit_price", e.target.value)} />
                                        </div>
                                    ))}
                                    <button className="btn secondary" onClick={addEditableInventoryItem}>Add Item</button>

                                    <h4>Edit Other Details</h4>
                                    <div className="grid grid-2">
                                        <div>
                                            <label className="label">Status</label>
                                            <select className="input" value={editData.status || ""} onChange={e => handleEditChange("status", e.target.value)}>
                                                <option value="NEW">NEW</option>
                                                <option value="FOLLOW_UP">FOLLOW UP</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="BILLED">BILLED</option>
                                                <option value="RETURNED">RETURNED</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Assigned To (User Email)</label>
                                            <input className="input" type="email" value={editData.assigned_to_user_email || ""} onChange={e => handleEditChange("assigned_to_user_email", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Follow-up Date (YYYY-MM-DD)</label>
                                            <input className="input" type="date" value={editData.follow_up_at || ""} onChange={e => handleEditChange("follow_up_at", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Feedback</label>
                                            <textarea className="input" value={editData.feedback || ""} onChange={e => handleEditChange("feedback", e.target.value)}></textarea>
                                        </div>
                                    </div>

                                    <button className="btn" onClick={saveEditedLead} style={{ marginTop: 20 }}>Save Changes</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card">
                            <p>Select a lead from the list to view its details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}