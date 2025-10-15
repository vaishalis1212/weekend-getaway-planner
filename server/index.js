import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeVectorStore } from "./langchain/vectorStore.js";
import { handleChatQuery } from "./langchain/chains.js";
import { getWeatherForCity, getWeatherForecast } from "./services/weatherService.js";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// DEBUG: Check if API key is loaded
console.log("🔑 API Key loaded:", process.env.OPENAI_API_KEY ? "YES ✅" : "NO ❌");
if (process.env.OPENAI_API_KEY) {
  console.log("🔑 First 10 chars:", process.env.OPENAI_API_KEY.substring(0, 10));
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize vector store on server startup
let isVectorStoreReady = false;

async function setupVectorStore() {
  try {
    await initializeVectorStore();
    isVectorStoreReady = true;
    console.log("🎉 Server is ready to accept requests!");
  } catch (error) {
    console.error("❌ Failed to initialize vector store:", error);
    process.exit(1);
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    vectorStoreReady: isVectorStoreReady,
    message: "Weekend Getaway Planner API is running!",
  });
});

// Weather API endpoint (current weather only)
app.get("/api/weather/:cityName", async (req, res) => {
  try {
    const { cityName } = req.params;

    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    console.log(`🌤️  Weather request for: ${cityName}`);

    const weatherData = await getWeatherForCity(cityName);

    res.json(weatherData);
  } catch (error) {
    console.error("❌ Error fetching weather:", error);
    res.status(500).json({
      error: "Failed to fetch weather data",
      details: error.message,
    });
  }
});

// Weather forecast API endpoint (with date range)
app.get("/api/weather/:cityName/forecast", async (req, res) => {
  try {
    const { cityName } = req.params;
    const { startDate, endDate } = req.query;

    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    console.log(`📅 Forecast request for: ${cityName} (${startDate} to ${endDate})`);

    const forecastData = await getWeatherForecast(cityName, startDate, endDate);

    res.json(forecastData);
  } catch (error) {
    console.error("❌ Error fetching forecast:", error);
    res.status(500).json({
      error: "Failed to fetch forecast data",
      details: error.message,
    });
  }
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userPreferences, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!isVectorStoreReady) {
      return res.status(503).json({
        error: "Vector store is still initializing. Please wait a moment.",
      });
    }

    console.log("📨 Received message:", message);
    console.log("📋 User preferences:", userPreferences);
    console.log("🔄 Raw Context:", JSON.stringify(context, null, 2));

    // Transform frontend preferences to match backend expectations
    const transformedPreferences = userPreferences ? {
      vibe: userPreferences.selectedVibe,  // Map selectedVibe → vibe
      departureCity: userPreferences.departureCity,
      budget: userPreferences.budget,
      interests: userPreferences.interests || [],
      startDate: userPreferences.startDate,
      endDate: userPreferences.endDate
    } : {};

    console.log("🔄 Transformed preferences:", transformedPreferences);

    // Build context object for the chain
    const fullContext = {
      userPreferences: transformedPreferences,
      selectedDestination: context?.selectedDestination || null,
      hasSeenItinerary: context?.hasSeenItinerary || false
    };

    console.log("✅ Full Context Built:", JSON.stringify(fullContext, null, 2));

    // Use the router to handle the query (returns comparison, detailed, or chat mode)
    const response = await handleChatQuery(message, fullContext);

    // Return response directly (it already has mode and data)
    res.json({
      ...response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error processing chat:", error);
    res.status(500).json({
      error: "Failed to process your request. Please try again.",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server starting on http://localhost:${PORT}`);
  console.log("⏳ Initializing vector store with destination data...\n");
  await setupVectorStore();
});