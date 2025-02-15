import React, { useState, useEffect } from "react";
import axios from "axios";

const RecommendedRecipes = ({ userId }) => {
    const [matchedRecipes, setMatchedRecipes] = useState([]);
    const [recommendedRecipes, setRecommendedRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchRecommendations();
        } else {
            console.warn("⚠️ userId is undefined or null, skipping fetch.");
        }
    }, [userId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔍 Fetching recommendations for user:", userId);
            const response = await axios.get(`http://localhost:5000/api/recommendations/recommend/${userId}`);

            console.log("✅ API Response:", response.data);

            if (Array.isArray(response.data) && response.data.length > 0) {
                categorizeRecipes(response.data);
            } else {
                console.warn("⚠️ No recipes found in API response.");
                setMatchedRecipes([]);
                setRecommendedRecipes([]);
            }
        } catch (error) {
            console.error("❌ Error fetching recipes:", error);
            setError("Failed to fetch recommendations. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const categorizeRecipes = (recipes) => {
        const matched = [];
        const recommended = [];
    
        recipes.forEach((recipe) => {
            console.log("📄 Recipe Data:", recipe);
    
            // ✅ Ensure required properties exist
            recipe.recipename = recipe.recipename || "Unnamed Recipe";
            recipe.cooking_time = recipe.cooking_time || "N/A";
            recipe.sustainability_notes = recipe.sustainability_notes || "No sustainability notes";
    
            // ✅ Ensure grocerymatched & ingredients_to_buy are always arrays
            recipe.grocerymatched = Array.isArray(recipe.grocerymatched) ? recipe.grocerymatched : [];
            recipe.ingredients_to_buy = Array.isArray(recipe.ingredients_to_buy) ? recipe.ingredients_to_buy : [];
    
            console.log(`📌 ${recipe.recipename} - Matched Ingredients:`, recipe.grocerymatched);
            console.log(`📌 ${recipe.recipename} - Ingredients to Buy:`, recipe.ingredients_to_buy);
    
            // ✅ Fix: Proper Categorization
            if (recipe.grocerymatched.length > 0 && recipe.ingredients_to_buy.length === 0) {
                console.log(`✅ ${recipe.recipename} added to Matched Recipes`);
                matched.push(recipe);
            } else if (recipe.grocerymatched.length > 0 && recipe.ingredients_to_buy.length > 0) {
                console.log(`🔹 ${recipe.recipename} added to Recommended Recipes`);
                recommended.push(recipe);
            }
        });
    
        console.log("✅ Final Matched Recipes:", matched);
        console.log("🔹 Final Recommended Recipes:", recommended);
    
        setMatchedRecipes(matched);
        setRecommendedRecipes(recommended);
    };
    

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ color: "#2c3e50" }}>🔹 Recommended Recipes</h1>

            {/* Loading State */}
            {loading && <p>Loading recommendations...</p>}

            {/* Error State */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* ✅ Matched Recipes (All Ingredients Match) */}
            {matchedRecipes.length > 0 && (
                <section style={{ marginBottom: "30px" }}>
                    <h2 style={{ color: "#358856", marginBottom: "10px" }}>✅ Matched Recipes (All Ingredients Available)</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {matchedRecipes.map((recipe) => (
                            <li key={recipe.recipeid} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                                <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>{recipe.recipename}</h3>
                                <p><strong>Cooking Time:</strong> {recipe.cooking_time} minutes</p>
                                <p><strong>Sustainability Notes:</strong> {recipe.sustainability_notes}</p>
                                <p>
                                    <strong>Matched Ingredients:</strong>{" "}
                                    {recipe.grocerymatched.length > 0 
                                        ? recipe.grocerymatched.map(ing => ing.ingredient_name).join(", ") 
                                        : "No ingredients matched"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* 🔹 Recommended Recipes (At Least One Ingredient Match) */}
            {recommendedRecipes.length > 0 && (
                <section style={{ marginBottom: "30px" }}>
                    <h2 style={{ color: "#358856", marginBottom: "10px" }}>🔹 Recommended Recipes (At Least One Ingredient Match)</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {recommendedRecipes.map((recipe) => (
                            <li key={recipe.recipeid} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                                <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>{recipe.recipename}</h3>
                                <p><strong>Cooking Time:</strong> {recipe.cooking_time} minutes</p>
                                <p><strong>Sustainability Notes:</strong> {recipe.sustainability_notes}</p>
                                <p>
                                    <strong>Matched Ingredients:</strong>{" "}
                                    {recipe.grocerymatched.length > 0 
                                        ? recipe.grocerymatched.map(ing => ing.ingredient_name).join(", ") 
                                        : "No ingredients matched"}
                                </p>
                                <p>
                                    <strong>Ingredients to Buy:</strong>{" "}
                                    {recipe.ingredients_to_buy.length > 0
                                        ? recipe.ingredients_to_buy.map(ing => ing.ingredient_name).join(", ")
                                        : "No additional ingredients needed"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ⚠️ No Recipes Case */}
            {!loading && matchedRecipes.length === 0 && recommendedRecipes.length === 0 && (
                <p style={{ color: "#666" }}>⚠️ No recipes match your groceries.</p>
            )}
        </div>
    );
};

export default RecommendedRecipes;
