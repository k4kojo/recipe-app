import { and, eq } from "drizzle-orm";
import express from "express";
import { db } from "./config/db.js";
import { ENV } from "./config/env.js";
import { favorites } from "./db/schema.js";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Save a recipe to favorites
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favorites)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite);
  } catch (e) {
    console.log("Error adding favorites", e);

    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a recipe from favorites
app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const deletedFavorites = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.recipeId, parseInt(recipeId))
        )
      )
      .returning();

    res
      .status(200)
      .json({ message: "Favorite deleted successfully", deletedFavorites });
  } catch (e) {
    console.log("Error deleting favorite", e);

    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all favorite recipes for a user
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    res.status(200).json({
      message: "User favorites retrieved successfully",
      userFavorites,
    });
  } catch (e) {
    console.log("Error retrieving user favorites", e);

    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
