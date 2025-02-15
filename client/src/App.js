import React, { useState, useEffect, createContext } from "react";
import {Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Registration";
import Home from "./components/Home";
import TheApp from "./components/TheApp";
import AboutUs from "./components/AboutUs";
import GroceryManager from "./components/GroceryManager";
import RecipeManager from "./components/RecipeManager";
import CookingManager from "./components/CookingManager";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import UserManagement from "./components/UserManagement";
import RecipeInventory from "./components/RecipeInventory";
import RecommendedRecipes from "./components/RecommendedRecipes";
import ChangePassword from "./components/ChangePassword";
import Inventory from "./components/Inventory";
import FoodWasteChart from "./components/FoodWasteChart";
import { UserProvider } from "./components/UserContext";
import Navbar from "./components/Navbar";

export const AuthContext = createContext();

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const savedAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
      const savedAdmin = localStorage.getItem("isAdmin") || sessionStorage.getItem("isAdmin");

      if (savedUser && savedAuth) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(JSON.parse(savedAuth) === true);
        setIsAdmin(JSON.parse(savedAdmin) === true);
      }
    } catch (error) {
      console.error("Error initializing authentication state:", error.message);
    }
  }, []);

  const handleLogin = (role, loggedInUser, rememberMe) => {
    const isUserAdmin = role.toLowerCase() === "admin";
    setIsAuthenticated(true);
    setIsAdmin(isUserAdmin);
    setUser(loggedInUser);

    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(loggedInUser));
      storage.setItem("isAuthenticated", JSON.stringify(true));
      storage.setItem("isAdmin", JSON.stringify(isUserAdmin));
    } catch (error) {
      console.error("Error during login state storage:", error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  const hideNavbarPaths = ["/login", "/register", "/admin-dashboard", "/home"];
  const showNavbar = !hideNavbarPaths.some(path => location.pathname.startsWith(path)) && isAuthenticated;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin, user, setUser, handleLogout }}>
      {showNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/the-app" element={<TheApp />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user-dashboard" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/groceries" element={isAuthenticated ? <GroceryManager userId={user?.id} /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/cooking" element={isAuthenticated ? <CookingManager userId={user?.id} /> : <Navigate to="/login" />} />
        <Route path="/recommended-recipes" element={isAuthenticated ? <RecommendedRecipes userId={user?.id} /> : <Navigate to="/login" />} />
        <Route path="/food-waste-chart" element={isAuthenticated ? <FoodWasteChart userId={user?.id} /> : <Navigate to="/login" />} />
        <Route path="/change-password/:userId" element={<ChangePassword />} />
        <Route path="/recipe-manager" element={<RecipeManager />} />
        <Route path="/recipe-library" element={<RecipeInventory />} />

        <Route path="/admin-dashboard" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard/recipes" element={isAuthenticated && isAdmin ? <RecipeManager /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard/manage-users" element={isAuthenticated && isAdmin ? <UserManagement /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard/inventory" element={isAuthenticated && isAdmin ? <RecipeInventory /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;