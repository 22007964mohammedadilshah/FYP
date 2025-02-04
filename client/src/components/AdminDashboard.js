import React, { useState } from 'react';
import RecipeManager from './RecipeManager';
import UserManagement from './UserManagement';
import Inventory from './Inventory';
import logoImage from './Logo.jpg'; 

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('recipes');

    const handleRecipeAdded = (newRecipe) => {
        console.log("Recipe added:", newRecipe);
        alert("New recipe added successfully!");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'recipes':
                return <RecipeManager onRecipeAdded={handleRecipeAdded} />;
            case 'users':
                return <UserManagement />;
            case 'inventory':
                return <Inventory />;
            default:
                return <RecipeManager onRecipeAdded={handleRecipeAdded} />;
        }
    };

    const styles = {
        container: {
            fontFamily: `'Arial', sans-serif`,
            padding: '20px',
            minHeight: '100vh',
            backgroundColor: '#f9f9f9',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: '2px solid #ddd',
            marginBottom: '20px',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
        },
        logo: {
            height: '60px',
            width: '60px',
            marginRight: '15px',
            borderRadius: '50%',
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#358856',
        },
        nav: {
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px',
        },
        button: (isActive) => ({
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: isActive ? '#fff' : '#000',
            backgroundColor: isActive ? '#007BFF' : '#f1f1f1',
            border: isActive ? '2px solid #0056b3' : '1px solid #ccc',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isActive ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
        }),
        buttonHover: {
            transform: 'scale(1.1)',
        },
        content: {
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.logoContainer}>
                    <img src={logoImage} alt="Logo" style={styles.logo} />
                    <h1 style={styles.title}>Sustainable Bao</h1>
                </div>
            </div>
            <nav style={styles.nav}>
                <button
                    style={styles.button(activeTab === 'recipes')}
                    onMouseOver={(e) => (e.target.style.transform = styles.buttonHover.transform)}
                    onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                    onClick={() => setActiveTab('recipes')}
                >
                    Manage Recipes
                </button>
                <button
                    style={styles.button(activeTab === 'users')}
                    onMouseOver={(e) => (e.target.style.transform = styles.buttonHover.transform)}
                    onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button
                    style={styles.button(activeTab === 'inventory')}
                    onMouseOver={(e) => (e.target.style.transform = styles.buttonHover.transform)}
                    onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory
                </button>
            </nav>
            <div style={styles.content}>{renderContent()}</div>
        </div>
    );
};

export default AdminDashboard;
