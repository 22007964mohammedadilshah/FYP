import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [groceries, setGroceries] = useState([]);
    const [expiredGroceries, setExpiredGroceries] = useState([]);
    const [wasteSummary, setWasteSummary] = useState({ low: 0, medium: 0, high: 0, expired: 0 });
    const [totalWasteCost, setTotalWasteCost] = useState(0);
    const [wasteReductionTips, setWasteReductionTips] = useState([]);
    const [editingGrocery, setEditingGrocery] = useState(null); 
    const [showEditModal, setShowEditModal] = useState(false);  

    // Helper function to capitalize the first letter of a string
    const capitalizeFirstLetter = (str) => {
        if (!str) return ""; // Handle empty or undefined strings
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (!user || !user.id) {
            navigate("/login");
        } else {
            fetchGroceries(user.id);
        }
    }, [user, navigate]);

    const fetchGroceries = useCallback(async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/groceries/${userId}`);
            setGroceries(response.data);
            filterExpiredItems(response.data);
            calculateWasteSummary(response.data);
            calculateWasteCost(response.data);
            generateWasteReductionTips(response.data);
        } catch (error) {
            console.error("Error fetching groceries:", error.message);
            alert("❌ Failed to fetch groceries.");
        }
    }, []);

    const filterExpiredItems = (data) => {
        const expired = data.filter(item => new Date(item.date_of_expiry) < new Date());
        setExpiredGroceries(expired);
    };

    const calculateWasteSummary = (data) => {
        let summary = { low: 0, medium: 0, high: 0, expired: 0 };
        data.forEach(item => {
            const daysToExpiry = (new Date(item.date_of_expiry) - new Date()) / (1000 * 60 * 60 * 24);
            if (daysToExpiry >= 8) summary.low++;
            else if (daysToExpiry >= 4) summary.medium++;
            else if (daysToExpiry >= 0) summary.high++;
            else summary.expired++;
        });
        setWasteSummary(summary);
    };

    const calculateWasteCost = (data) => {
        let cost = 0;
        data.forEach(item => {
            if (new Date(item.date_of_expiry) < new Date()) {
                cost += item.quantity * item.price;
            }
        });
        setTotalWasteCost(cost);
    };

    const generateWasteReductionTips = (data) => {
        let tips = [];
        const mostWasted = data.filter(item => new Date(item.date_of_expiry) < new Date()).map(item => item.name);
        if (mostWasted.length > 0) {
            tips.push(`Consider buying less of: ${[...new Set(mostWasted)].join(", ")}`);
        }
        if (wasteSummary.high > 0) {
            tips.push("Plan meals better to use up food before it expires.");
        }
        if (wasteSummary.medium > 0) {
            tips.push("Store food properly to extend shelf life.");
        }
        setWasteReductionTips(tips);
    };

    const handleDeleteGrocery = async (groceryId) => {
        try {
            await axios.delete(`http://localhost:5000/api/groceries/${user.id}/${groceryId}`);
            setGroceries((prev) => prev.filter(item => item.groceryid !== groceryId)); // ✅ Ensure `groceryid` is used
            alert("✅ Grocery deleted successfully!");
        } catch (error) {
            console.error("Error deleting grocery:", error.message);
            alert("❌ Failed to delete grocery.");
        }
    };
    
    const handleEditGrocery = async (groceryId) => {
        if (!user || !user.id) {
            alert("❌ You must be logged in to edit a grocery.");
            navigate("/login");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/groceries/${user.id}/${groceryId}`);
            const data = await response.json();
    
            if (data.error) {
                alert("❌ Grocery not found.");
                return;
            }
    
            
            setEditingGrocery(data);
            setShowEditModal(true);  
        } catch (error) {
            console.error("❌ Error fetching grocery for edit:", error);
            alert("❌ Failed to fetch grocery details.");
        }
    };
    
    
    

   
    const sortedGroceries = [...groceries].sort((a, b) => new Date(a.createdat) - new Date(b.createdat));

    // Function to format dates as DD/MM/YYYY from ISO 8601 format
    const formatDate = (dateStr) => {
        const date = new Date(dateStr); // Convert the string to a Date object
        const day = date.getDate().toString().padStart(2, '0'); // Get day and ensure 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month and ensure 2 digits
        const year = date.getFullYear(); // Get full year
        return `${day}/${month}/${year}`;  // Format to DD/MM/YYYY
    };

    // Function to format expiry date as DD/MM/YYYY from ISO 8601 format
    const formatExpiryDate = (expiryStr) => {
        const date = new Date(expiryStr); // Convert the string to a Date object
        const day = date.getDate().toString().padStart(2, '0'); // Get day and ensure 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month and ensure 2 digits
        const year = date.getFullYear(); // Get full year
        return `${day}/${month}/${year}`;  // Format to DD/MM/YYYY
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <Navbar />
            <div style={{ width: '100%', maxWidth: '900px', marginTop: '100px', }}>
                <h1 style={{ textAlign: 'center', fontSize: "60px", fontFamily: "'Shadows Into Light', cursive", fontWeight: 'bold' }}>Inventory</h1>
                <p>Total Waste Cost: ${totalWasteCost.toFixed(2)}</p>
                {groceries.length === 0 ? (
                    <p>No groceries found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#dff0d8' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white', fontWeight: 'bold' }}>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Purchase Date</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Grocery Name</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Quantity + Unit</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Price</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Expiry Date</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Risk</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGroceries.map((grocery) => {
                                const daysToExpiry = (new Date(grocery.date_of_expiry) - new Date()) / (1000 * 60 * 60 * 24);
                                const isExpired = daysToExpiry < 0;
                                const purchaseDate = grocery.createdat ? new Date(grocery.createdat) : null;
                                const formattedPurchaseDate = purchaseDate && !isNaN(purchaseDate) ? formatDate(grocery.createdat) : "N/A";
                                const formattedExpiryDate = grocery.date_of_expiry ? formatExpiryDate(grocery.date_of_expiry) : "N/A";
                                let riskColor = "";

                                // Determine the background color based on risk level
                                if (isExpired) riskColor = "#f8d7da";  // Red for expired
                                else if (daysToExpiry >= 8) riskColor = "#d4edda";  // Green for low risk
                                else if (daysToExpiry >= 4) riskColor = "#fff3cd";  // Yellow for medium risk
                                else riskColor = "#ffeeba";  // Orange for high risk

                                return (
                                    <tr key={grocery.groceryid}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formattedPurchaseDate}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {capitalizeFirstLetter(grocery.name)} {/* Capitalize the first letter */}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{grocery.quantity} {grocery.unit}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>${grocery.price.toFixed(2)}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formattedExpiryDate}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: riskColor, textAlign: 'center' }}>
                                            {isExpired ? 'Expired' : daysToExpiry >= 8 ? 'Low Risk' : daysToExpiry >= 4 ? 'Medium Risk' : 'High Risk'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            
                                            <button onClick={() => handleEditGrocery(grocery.groceryid)} style={{ padding: '8px 16px', margin: '5px', cursor: 'pointer', border: 'none', backgroundColor: '#4CAF50', color: 'white' }}>Edit</button>
                                            <button onClick={() => handleDeleteGrocery(grocery.groceryid)} style={{ padding: '8px 16px', margin: '5px', cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: 'white' }}>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>  

            {/* Right Side for Expired Products, Risk Summary, Waste Reduction Tips */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', marginTop: '30px' }}>
                <div style={{ flex: 1, backgroundColor: '#e7f9e7', padding: '20px', borderRadius: '10px' }}>
                    <h3>Expired Products</h3>
                    {expiredGroceries.length === 0 ? (
                        <p>No expired products.</p>
                    ) : (
                        <ul>
                            {expiredGroceries.map(item => (
                                <li key={item.groceryid}>
                                    {capitalizeFirstLetter(item.name)} (Expired on {formatExpiryDate(item.date_of_expiry)})
                                    <button onClick={() => handleDeleteGrocery(item.groceryid)} style={{ padding: '8px 16px', margin: '5px', cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: 'white' }}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div style={{ flex: 1, backgroundColor: '#e7f9e7', padding: '20px', borderRadius: '10px' }}>
                    <h3>Risk Summary</h3>
                    <p>Low Risk: {wasteSummary.low}</p>
                    <p>Medium Risk: {wasteSummary.medium}</p>
                    <p>High Risk: {wasteSummary.high}</p>
                    <p>Expired: {wasteSummary.expired}</p>
                </div>

                <div style={{ flex: 1, backgroundColor: '#e7f9e7', padding: '20px', borderRadius: '10px' }}>
                    <h3>Waste Reduction Tips</h3>
                    <ul>
                        {wasteReductionTips.length === 0 ? (
                            <p>No tips available.</p>
                        ) : (
                            wasteReductionTips.map((tip, index) => <li key={index}>{tip}</li>)
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Inventory;