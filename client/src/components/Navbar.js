import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import logoImage from "./Logo.jpg";
import LogoutButton from "../components/LogoutButton";
import { UserContext } from "../components/UserContext";

// Ensure the modal knows which part of the DOM it should be attached to
Modal.setAppElement("#root");

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext) || {};
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const username = user?.username || "Guest";
    const userId = user?.id || null;

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            const response = await fetch(`/api/change-password/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword }),
            });

            if (response.ok) {
                alert("Password changed successfully");
                setIsChangePasswordModalOpen(false);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to change password");
            }
        } catch (err) {
            setError("An error occurred while changing the password");
        }
    };

    // ✅ Adjusted Navbar Styles for a single-line layout
    const styles = {
        navbar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#2e856e",
            padding: "8px 15px",
            width: "100%",
            position: "fixed",
            top: "0",
            left: "0",
            zIndex: "1000",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            flexWrap: "nowrap",
        },
        logoContainer: { display: "flex", alignItems: "center", gap: "10px" },
        logo: { height: "40px", width: "40px", borderRadius: "50%" },
        title: { fontSize: "18px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" },
        buttonContainer: {
            display: "flex",
            gap: "5px",
            flexGrow: 1,
            justifyContent: "center",
            flexWrap: "nowrap",
        },
        button: {
            padding: "6px 8px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "#1e3a34",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.2s ease",
            minWidth: "110px",
            whiteSpace: "nowrap",
        },
        buttonHover: { backgroundColor: "#144f3c", transform: "scale(1.05)" },
        logoutContainer: { display: "flex", alignItems: "center", gap: "10px" },
        profileButton: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
            background: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            transition: "background-color 0.3s",
        },
        profileDropdown: {
            display: isProfileDropdownOpen ? "block" : "none",
            position: "absolute",
            top: "40px",
            right: "10px",
            background: "#fff",
            padding: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            zIndex: 10,
        },
        modalContent: { padding: "20px", background: "#fff", borderRadius: "8px" },
        input: { display: "block", margin: "10px 0", padding: "8px", width: "100%" },
        error: { color: "red", fontSize: "14px" }
    };

    return (
        <div style={styles.navbar}>
            {/* ✅ Left Side - Logo */}
            <div style={styles.logoContainer}>
                <img src={logoImage} alt="Logo" style={styles.logo} />
                <span style={styles.title}>SUSTAINABLE BAO</span>
            </div>

            {/* ✅ Center - Navigation Buttons */}
            <div style={styles.buttonContainer}>
                <button
                    style={styles.button}
                    onClick={() => navigate("/groceries")}
                >
                    Add Grocery
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/inventory")}
                >
                    My Grocery
                </button>
                <button
                    style={styles.button}
                    onClick={() => navigate("/recommended-recipes")}
>
                    Recommendations
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/cooking")}
                >
                    Cook with me
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/food-waste-chart")}
                >
                    Waste Chart
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/recipe-manager")}
                >
                    Add Recipes
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/recipe-library")}
                >
                    Recipe Library
                </button>
            </div>

            {/* ✅ Right Side - Profile and Logout */}
            <div style={styles.logoutContainer}>
                <button style={styles.profileButton} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                    👤 <span>{username}</span>
                </button>

                {isProfileDropdownOpen && (
                    <div style={styles.profileDropdown}>
                        <div style={{ cursor: "pointer", padding: "5px 0" }} onClick={() => setIsChangePasswordModalOpen(true)}>
                            Change Password
                        </div>
                    </div>
                )}

                <LogoutButton />
            </div>

            {/* ✅ Change Password Modal */}
            <Modal
                isOpen={isChangePasswordModalOpen}
                onRequestClose={() => setIsChangePasswordModalOpen(false)}
                contentLabel="Change Password Modal"
                style={{
                    overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                    content: { padding: "20px", background: "#fff", borderRadius: "8px", maxWidth: "400px", margin: "auto", textAlign: "center" },
                }}
            >
                <h2>Change Password</h2>
                {error && <p style={styles.error}>{error}</p>}
                <button onClick={handleChangePassword} style={styles.button}>
                    Change Password
                </button>
            </Modal>
        </div>
    );
};

export default Navbar;
