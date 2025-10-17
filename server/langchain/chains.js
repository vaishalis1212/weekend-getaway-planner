import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { searchDestinations } from "./vectorStore.js";
import { SYSTEM_PROMPT, MODEL_CONFIG } from "./config.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load comparison data
const comparisonData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/destinations_comparison.json'), 'utf-8')
);

// Load destination images
const destinationImages = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/destination_images.json'), 'utf-8')
);

// Initialize the LLM (lazily, so env vars are loaded)
function getLLM() {
  return new ChatOpenAI({
    modelName: MODEL_CONFIG.modelName,
    temperature: MODEL_CONFIG.temperature,
    maxTokens: MODEL_CONFIG.maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

// Helper: Detect if message is a destination selection
function isDestinationSelection(message) {
  const lowerMessage = message.toLowerCase();
  const selectionKeywords = ['choose', 'select', 'i want', 'pick', 'go with', 'decide on'];
  return selectionKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper: Extract destination name from selection message
function extractDestinationName(message) {
  const destinations = comparisonData.destinations.map(d => d.name);
  const lowerMessage = message.toLowerCase();

  for (const dest of destinations) {
    if (lowerMessage.includes(dest.toLowerCase())) {
      return dest;
    }
  }
  return null;
}

// Helper: Detect if user wants to plan another trip
function isPlanAnotherTrip(message) {
  const lowerMessage = message.toLowerCase();

  // EXPLICIT trip planning phrases - these are strong signals
  const explicitKeywords = [
    'plan another trip',
    'new trip',
    'different destination',
    'plan a trip',
    'plan trip',
    'new getaway',
    'another getaway',
    'help me plan',
    'help me create',
    'create itinerary',
    'create a plan',
    'make a plan'
  ];

  // Check for explicit phrases first
  if (explicitKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return true;
  }

  // Check various patterns for trip planning intent
  const patterns = [
    /^(plan|planning)\s+(a\s+)?(\w+\s+)?trip/i,                    // "plan a trip", "planning udaipur trip"
    /^(help|assist)\s+(me\s+)?(plan|create|make)/i,                // "help me plan", "help create itinerary"
    /(create|make|build|generate)\s+(an?\s+)?(itinerary|plan)/i,  // "create an itinerary", "make a plan"
    /^(what about|how about)\s+\w+/i,                               // "what about Gokarna", "how about Udaipur"
    /(trip|visit|travel)\s+to\s+\w+/i                               // "trip to Udaipur", "travel to Coorg"
  ];

  return patterns.some(pattern => pattern.test(message));
}

// Helper: Check if user mentioned a specific destination
function hasSpecificDestination(message) {
  const destinations = comparisonData.destinations.map(d => d.name.toLowerCase());
  const lowerMessage = message.toLowerCase();

  for (const dest of destinations) {
    if (lowerMessage.includes(dest)) {
      return extractDestinationName(message);
    }
  }
  return null;
}

// Helper: Identify missing preferences
function getMissingPreferences(currentPreferences) {
  const missing = [];

  if (!currentPreferences.vibe) {
    missing.push('vibe');
  }
  if (!currentPreferences.departureCity) {
    missing.push('departureCity');
  }
  if (!currentPreferences.budget) {
    missing.push('budget');
  }
  if (!currentPreferences.startDate || !currentPreferences.endDate) {
    missing.push('dates');
  }
  if (!currentPreferences.interests || currentPreferences.interests.length === 0) {
    missing.push('interests');
  }

  return missing;
}

// Helper: Build comprehensive question prompt
function buildPreferenceQuestionPrompt(missingFields, specificDestination = null) {
  if (missingFields.length === 0) {
    return null;
  }

  const questions = [];
  let questionNumber = 1;

  // Skip vibe question if specific destination is mentioned
  if (missingFields.includes('vibe') && !specificDestination) {
    questions.push(`**${questionNumber}. What's your ideal getaway vibe?** (Beach escape, Mountain retreat, Adventure & thrills, Peaceful & serene, Cultural exploration, or Nature immersion)`);
    questionNumber++;
  }

  if (missingFields.includes('departureCity')) {
    questions.push(`**${questionNumber}. Where are you starting from?** (Your departure city)`);
    questionNumber++;
  }

  if (missingFields.includes('budget')) {
    questions.push(`**${questionNumber}. What's your budget?** (Approximate amount in ₹ for the entire trip)`);
    questionNumber++;
  }

  if (missingFields.includes('dates')) {
    questions.push(`**${questionNumber}. What are your travel dates?** (Start date and end date in YYYY-MM-DD format, e.g., 2025-11-15 to 2025-11-17)`);
    questionNumber++;
  }

  if (missingFields.includes('interests')) {
    questions.push(`**${questionNumber}. What interests you?** (Activities like hiking, food tours, photography, water sports, spiritual experiences, wildlife, adventure sports, beach activities, etc.)`);
    questionNumber++;
  }

  const intro = specificDestination
    ? `Great choice! ${specificDestination} is a wonderful destination! 🌟\n\nTo create the perfect itinerary for you, I need some more information. Please answer the following questions (you can answer them all at once):\n\n`
    : "I'd be happy to help you plan another amazing trip! 🌟\n\nTo create the perfect itinerary for you, I need some information. Please answer the following questions (you can answer them all at once):\n\n";

  const outro = "\n\nFeel free to provide all the details in one message!";

  return intro + questions.join("\n\n") + outro;
}

// Helper: Parse user's preference response using LLM
async function parsePreferencesFromMessage(userMessage, missingFields) {
  try {
    const promptText = `Extract travel preferences from the user's message and format them as JSON.

Missing fields we need: ${missingFields.join(', ')}

User's message: "${userMessage}"

Extract the following information (if provided):
- vibe: The type of getaway (Beach escape, Mountain retreat, Adventure & thrills, Peaceful & serene, Cultural exploration, Nature immersion, etc.)
- departureCity: The city they're departing from
- budget: The budget amount (extract numbers only, assume ₹/INR currency)
- startDate: Travel start date (format as YYYY-MM-DD)
- endDate: Travel end date (format as YYYY-MM-DD)
- interests: Array of activities/interests (e.g., ["hiking", "food tours", "photography"])

Return ONLY a valid JSON object with the extracted fields. If a field is not mentioned, omit it from the JSON.

Example output format:
{
  "vibe": "Beach escape",
  "departureCity": "Mumbai",
  "budget": "15000",
  "startDate": "2025-11-15",
  "endDate": "2025-11-17",
  "interests": ["water sports", "beach activities", "photography"]
}`;

    const chain = getLLM().pipe(new StringOutputParser());
    const result = await chain.invoke(promptText);

    console.log('🤖 LLM parsing response:', result);

    // Parse the JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed preferences:', parsed);
      return parsed;
    }

    console.log('⚠️ Could not parse preferences from LLM response');
    return {};

  } catch (error) {
    console.error('❌ Error parsing preferences:', error.message);
    return {};
  }
}

// Helper: Calculate match score
function calculateMatchScore(destination, userPreferences) {
  let score = 0;

  // Budget match (30 points)
  if (userPreferences.budget) {
    const destBudget = parseInt(destination.comparisonData.budget.replace(/[^\d]/g, ''));
    const userBudget = parseInt(userPreferences.budget);
    const budgetDiff = Math.abs(destBudget - userBudget);
    if (budgetDiff < 5000) score += 30;
    else if (budgetDiff < 10000) score += 20;
    else if (budgetDiff < 15000) score += 10;
    else score += 5;
  } else {
    score += 15; // Default points if no budget specified
  }

  // Vibe match (25 points)
  if (userPreferences.vibe && destination.matchCriteria.vibes.includes(userPreferences.vibe)) {
    score += 25;
  } else if (userPreferences.vibe) {
    // Partial match for similar vibes
    const vibeKeywords = userPreferences.vibe.toLowerCase().split(' ');
    const destVibes = destination.matchCriteria.vibes.join(' ').toLowerCase();
    if (vibeKeywords.some(keyword => destVibes.includes(keyword))) {
      score += 10;
    }
  }

  // Departure city match (20 points)
  if (userPreferences.departureCity) {
    const travelTime = destination.comparisonData.travelTime[userPreferences.departureCity];
    if (travelTime && !travelTime.includes('Not recommended')) {
      const hours = parseInt(travelTime);
      if (hours <= 6) score += 20;
      else if (hours <= 12) score += 15;
      else if (hours <= 18) score += 10;
      else score += 5;
    }
  } else {
    score += 10; // Default points if no city specified
  }

  // Interests match (15 points)
  if (userPreferences.interests && userPreferences.interests.length > 0) {
    const matchingInterests = userPreferences.interests.filter(interest =>
      destination.matchCriteria.interests.includes(interest)
    );
    score += Math.min(matchingInterests.length * 5, 15);
  } else {
    score += 7; // Default points if no interests specified
  }

  // Travel time feasibility (10 points)
  if (userPreferences.departureCity) {
    const travelTime = destination.comparisonData.travelTime[userPreferences.departureCity];
    if (travelTime && !travelTime.includes('Not recommended')) {
      score += 10;
    }
  } else {
    score += 5; // Default points if no city specified
  }

  return Math.min(score, 100);
}

// Helper function to generate context-aware chat response messages
function generateComparisonMessage(userMessage, topDestinations, userPreferences) {
  const destinationNames = topDestinations.map(d => d.name).join(', ');
  const messageLower = userMessage.toLowerCase();

  // Budget adjustment
  if (messageLower.includes('budget') || messageLower.includes('₹') || messageLower.includes('rs')) {
    const budgetMatch = userMessage.match(/₹?\s?(\d+,?\d*)/);
    if (budgetMatch) {
      return `Great! I've found ${topDestinations.length} destinations that fit your budget. Check them out above!`;
    }
    return `I've updated the recommendations based on your budget preferences. Here are ${topDestinations.length} great options!`;
  }

  // Other suggestions / alternatives
  if (messageLower.includes('other') || messageLower.includes('more') || messageLower.includes('different') ||
      messageLower.includes('alternative') || messageLower.includes('else')) {
    return `Here are ${topDestinations.length} more amazing destinations for you: ${destinationNames}. Each one offers something unique!`;
  }

  // Can't see results / where are results
  if (messageLower.includes('don\'t see') || messageLower.includes('cant see') || messageLower.includes('can\'t see') ||
      messageLower.includes('where') || messageLower.includes('show me') || messageLower.includes('no result')) {
    return `I found ${topDestinations.length} perfect destinations for you! You can see ${destinationNames} above. Click on any card to explore more details!`;
  }

  // Same details / preferences
  if (messageLower.includes('same') || messageLower.includes('as before') || messageLower.includes('previous')) {
    const vibeText = userPreferences.vibe ? ` for your ${userPreferences.vibe} getaway` : '';
    const cityText = userPreferences.departureCity ? ` from ${userPreferences.departureCity}` : '';
    return `Perfect! Based on your preferences${vibeText}${cityText}, here are your top ${topDestinations.length} matches: ${destinationNames}`;
  }

  // Vibe-specific queries
  if (messageLower.includes('beach') || messageLower.includes('mountain') || messageLower.includes('heritage') ||
      messageLower.includes('spiritual') || messageLower.includes('nature')) {
    return `I've found ${topDestinations.length} destinations perfect for your vibe! Check out ${destinationNames} above.`;
  }

  // Plan another trip (initial request)
  if (messageLower.includes('plan') && messageLower.includes('trip')) {
    return `I'd love to help you plan another trip! I've prepared ${topDestinations.length} wonderful destinations based on your preferences. Take a look at ${destinationNames} above!`;
  }

  // Default message with more context
  const vibeText = userPreferences.vibe ? ` for your ${userPreferences.vibe} getaway` : '';
  const cityText = userPreferences.departureCity ? ` from ${userPreferences.departureCity}` : '';
  return `Based on your preferences${vibeText}${cityText}, here are your top ${topDestinations.length} matches: ${destinationNames}!`;
}

// COMPARISON CHAIN
export async function createComparisonChain(userMessage, userPreferences = {}) {
  console.log('🔍 Creating comparison for preferences:', userPreferences);

  // Filter destinations based on basic criteria
  let matchedDestinations = comparisonData.destinations.filter(dest => {
    // Filter out destinations with "Not recommended" travel time
    if (userPreferences.departureCity) {
      const travelTime = dest.comparisonData.travelTime[userPreferences.departureCity];
      if (travelTime && travelTime.includes('Not recommended')) {
        return false;
      }
    }
    return true;
  });

  // Calculate match scores
  matchedDestinations = matchedDestinations.map(dest => ({
    ...dest,
    matchScore: calculateMatchScore(dest, userPreferences)
  }));

  // Sort by match score (descending)
  matchedDestinations.sort((a, b) => b.matchScore - a.matchScore);

  // Take top 3 (or 2 if only 2 available)
  const topDestinations = matchedDestinations.slice(0, Math.min(3, matchedDestinations.length));

  console.log(`✅ Found ${topDestinations.length} matching destinations`);

  // Generate context-aware message
  const contextualMessage = generateComparisonMessage(userMessage, topDestinations, userPreferences);

  // Format response
  const comparisonResponse = {
    mode: "comparison",
    message: contextualMessage,
    destinations: topDestinations.map(dest => ({
      name: dest.name,
      tagline: dest.tagline,
      matchScore: dest.matchScore,
      whyPerfect: dest.comparisonData.whyPerfect,
      pros: dest.comparisonData.pros,
      budget: dest.comparisonData.budget,
      travelTime: userPreferences.departureCity
        ? dest.comparisonData.travelTime[userPreferences.departureCity]
        : 'Travel time varies by departure city',
      bestFor: dest.comparisonData.bestFor,
      hiddenGem: dest.comparisonData.hiddenGem,
      bestTimeToVisit: dest.comparisonData.bestTimeToVisit,
      quickItineraryPreview: dest.comparisonData.quickItineraryPreview
    }))
  };

  return comparisonResponse;
}

// DETAILED ITINERARY CHAIN (Original chain for full itinerary)
export async function createDetailedItineraryChain(userMessage, destinationName) {
  console.log(`🗺️ Creating detailed itinerary for: ${destinationName}`);

  // Create enhanced query for better RAG retrieval
  const enhancedQuery = `${userMessage} ${destinationName} complete itinerary romantic couples`;

  // Detailed prompt template with structured format (no tables)
  const DETAILED_PROMPT_TEMPLATE = `You are creating a comprehensive weekend itinerary for ${destinationName}.

DESTINATION INFO:
{context}

USER REQUEST: {query}

Create a detailed, actionable itinerary following this EXACT structure (no tables, use this format):

---START FORMAT---

## ${destinationName} - Weekend Itinerary

**Why Visit:**
Write 2-3 sentences explaining what makes this destination special and perfect for couples.

**Where to Stay:**
[Hotel Name] - ₹[Price] per night
[2-3 sentences about the hotel, amenities, and why it's perfect for couples]

**Day 1: [Theme like "Beach Exploration" or "Arrival & Relaxation"]**

ACTIVITY: Arrival & Check-in
TIME: 8:00 AM
DETAILS: Arrive in Gokarna and check into [Hotel Name]. Freshen up and get ready to explore.
COST: ₹0
ICON: 🏨

ACTIVITY: Breakfast at [Restaurant Name]
TIME: 9:00 AM
DETAILS: Enjoy a hearty breakfast with options like pancakes, fresh fruit, and local delicacies.
COST: ₹700
ICON: 🍽️

ACTIVITY: Om Beach Visit
TIME: 10:00 AM
DETAILS: Walk to Om Beach, shaped like the Om symbol. Relax on soft sands and swim in calm waters.
COST: ₹0
ICON: 🏖️

[Continue with 4-5 more activities for Day 1]

**Day 2: [Theme like "Cultural & Scenic Exploration"]**

ACTIVITY: [Activity Name]
TIME: [Time]
DETAILS: [Detailed description]
COST: ₹[Amount]
ICON: [Emoji - use 🍽️ for food, 🏖️ for beach, 🛕 for temples, 🚶 for walks, 🌅 for sunset, 🎨 for cultural, 🧘 for yoga/wellness]

[Continue with 4-5 activities for Day 2]

**Budget Breakdown:**

CATEGORY: Transport
DETAILS: Train/bus from [City] + local auto/bike rentals
AMOUNT: ₹4,000

CATEGORY: Accommodation
DETAILS: [Hotel Name] - 2 nights
AMOUNT: ₹7,000

CATEGORY: Food
DETAILS: 6 meals at local restaurants and beach shacks
AMOUNT: ₹4,200

CATEGORY: Activities
DETAILS: Beach activities, temple visits, boat rides
AMOUNT: ₹2,000

TOTAL: ₹17,200

**Hidden Gems:**

GEM: [Place Name]
DESCRIPTION: [2-3 sentences about this hidden gem and why couples will love it]

GEM: [Place Name]
DESCRIPTION: [Description]

[3-4 hidden gems total]

**Practical Tips:**

BEST TIME: [Months and why]

PACKING ESSENTIALS:
- Swimwear and beach clothes
- Sunscreen and sunglasses
- Light cotton clothes
- Comfortable walking shoes
- Camera for sunset shots
[Add 3-5 more specific items]

LOCAL TRANSPORT: [Tips about getting around]

BOOKING TIPS: [Any advance booking recommendations]

---END FORMAT---

IMPORTANT:
- Follow this EXACT format with ACTIVITY:, TIME:, DETAILS:, COST:, ICON: labels
- Use specific names from the destination info
- Include packing essentials list
- Target 1200-1500 tokens
- Use appropriate emoji icons for each activity type`;

  const prompt = PromptTemplate.fromTemplate(DETAILED_PROMPT_TEMPLATE);

  const chain = RunnableSequence.from([
    {
      context: async (input) => {
        // Search for relevant destination documents
        const results = await searchDestinations(input.query, 3);
        // Combine the retrieved documents into context
        return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
      },
      query: (input) => input.query,
    },
    prompt,
    getLLM(),
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({ query: enhancedQuery });

  console.log(`✅ Generated detailed itinerary for ${destinationName}`);

  // Get images for this destination
  const destinationImageData = destinationImages[destinationName] || {};
  console.log(`📸 Images for ${destinationName}:`, JSON.stringify(destinationImageData, null, 2));

  // Return with mode metadata and images
  const response = {
    mode: "detailed",
    destination: destinationName,
    content: result,
    images: destinationImageData
  };

  console.log(`📦 Sending response with images:`, response.images ? 'YES' : 'NO');

  return response;
}

// CONTEXTUAL CHAT CHAIN (for follow-up questions about specific destination)
export async function createContextualChatChain(userMessage, context) {
  const { selectedDestination, userPreferences } = context;

  console.log(`💬 Creating contextual chat for: ${selectedDestination}`);

  // Search for relevant info about the selected destination
  const searchQuery = `${userMessage} ${selectedDestination}`;
  const relevantDocs = await searchDestinations(searchQuery, 3);
  const contextInfo = relevantDocs.map(doc => doc.pageContent).join("\n\n");

  // Use template with input variables
  const promptTemplate = new PromptTemplate({
    template: `You are a helpful travel planning assistant for an AI-powered weekend getaway planner for couples in India.

CONTEXT:
- User is planning a trip to: {destination}
- Their preferences: {preferences}
- They have already seen the detailed itinerary for {destination}

Relevant information about {destination}:
{context}

User's question: {question}

Provide a helpful, specific answer about {destination}.
Be conversational and reference their itinerary when relevant.
If they ask about modifications, explain how to adjust the itinerary.
Keep your answer concise but informative.`,
    inputVariables: ["destination", "preferences", "context", "question"]
  });

  const chain = promptTemplate.pipe(getLLM()).pipe(new StringOutputParser());

  const result = await chain.invoke({
    destination: selectedDestination,
    preferences: JSON.stringify(userPreferences || {}),
    context: contextInfo,
    question: userMessage
  });

  console.log(`✅ Generated contextual chat response for ${selectedDestination}`);

  return {
    mode: "chat",
    message: result.trim()
  };
}

// MAIN ROUTER CHAIN
export async function handleChatQuery(userMessage, context = {}) {
  try {
    console.log("🔍 Processing query:", userMessage);
    console.log("📋 Context:", context);

    // Check if user wants to plan another trip
    if (isPlanAnotherTrip(userMessage)) {
      console.log("🆕 User wants to plan another trip!");

      // Check if user mentioned a specific destination
      const specificDestination = hasSpecificDestination(userMessage);
      if (specificDestination) {
        console.log(`📍 Specific destination detected: ${specificDestination}`);
      }

      // Check if this message contains preference information (e.g., "plan a beach trip to Goa with budget 20000")
      // If the message is longer and contains more info, try to parse it
      const messageWords = userMessage.trim().split(/\s+/).length;

      if (messageWords > 10 || specificDestination) {
        // Message has substantial content or mentions a destination, try to parse preferences first
        console.log("🔍 Attempting to parse preferences from message...");
        const parsedPreferences = await parsePreferencesFromMessage(userMessage, ['vibe', 'departureCity', 'budget', 'dates', 'interests']);

        // If specific destination is mentioned, we can skip directly to itinerary if all other info is available
        if (specificDestination) {
          const stillMissing = getMissingPreferences(parsedPreferences).filter(field => field !== 'vibe');

          if (stillMissing.length === 0) {
            // All required info collected! Show detailed itinerary for specific destination
            console.log(`✅ All preferences collected, showing itinerary for ${specificDestination}`);
            return await createDetailedItineraryChain(userMessage, specificDestination);
          } else {
            // Still missing some fields, ask for them (without vibe question)
            console.log(`📝 Still missing after parsing: ${stillMissing.join(', ')}`);
            const questionPrompt = buildPreferenceQuestionPrompt(stillMissing, specificDestination);
            return {
              mode: "preferences_needed",
              message: questionPrompt,
              missingFields: stillMissing,
              partialPreferences: parsedPreferences,
              specificDestination: specificDestination
            };
          }
        } else {
          // No specific destination, need all preferences for comparison
          const stillMissing = getMissingPreferences(parsedPreferences);

          if (stillMissing.length === 0) {
            // All preferences collected from the message! Return comparison
            console.log("✅ All preferences collected from message, showing comparison");
            return await createComparisonChain(userMessage, parsedPreferences);
          } else {
            // Still missing some fields, ask for them
            console.log(`📝 Still missing after parsing: ${stillMissing.join(', ')}`);
            const questionPrompt = buildPreferenceQuestionPrompt(stillMissing);
            return {
              mode: "preferences_needed",
              message: questionPrompt,
              missingFields: stillMissing,
              partialPreferences: parsedPreferences
            };
          }
        }
      } else {
        // Short message (e.g., just "plan another trip") - ask for all preferences
        console.log("📝 Asking for all preferences");
        const allFields = ['vibe', 'departureCity', 'budget', 'dates', 'interests'];
        const questionPrompt = buildPreferenceQuestionPrompt(allFields);
        return {
          mode: "preferences_needed",
          message: questionPrompt,
          missingFields: allFields
        };
      }
    }

    // Check if user has seen detailed itinerary (chat mode)
    if (context.hasSeenItinerary && context.selectedDestination) {
      console.log("💬 User in chat mode for:", context.selectedDestination);

      // Check if this is a new destination selection
      if (isDestinationSelection(userMessage)) {
        const destinationName = extractDestinationName(userMessage);
        if (destinationName) {
          console.log(`✅ New destination selection: ${destinationName}`);
          return await createDetailedItineraryChain(userMessage, destinationName);
        }
      }

      // Otherwise, this is a follow-up question - use contextual chat
      return await createContextualChatChain(userMessage, context);
    }

    // Check if user is selecting a destination
    if (isDestinationSelection(userMessage)) {
      const destinationName = extractDestinationName(userMessage);
      if (destinationName) {
        console.log(`✅ Detected destination selection: ${destinationName}`);
        return await createDetailedItineraryChain(userMessage, destinationName);
      } else {
        console.log("⚠️ Selection detected but no valid destination found");
      }
    }

    // Check if this looks like a general question (not a trip planning request)
    // If the message is short and asks a question, treat it as a chat query
    const questionKeywords = ['what', 'where', 'when', 'how', 'which', 'why', 'is', 'are', 'can', 'tell', 'suggest', 'recommend'];
    const isQuestion = questionKeywords.some(keyword => userMessage.toLowerCase().trim().startsWith(keyword));

    if (isQuestion && userMessage.split(/\s+/).length < 15) {
      console.log("💬 Detected general question, using contextual chat");
      // Use contextual chat with generic context
      return await createContextualChatChain(userMessage, {
        selectedDestination: null,
        userPreferences: context.userPreferences
      });
    }

    // Otherwise, return comparison
    console.log("📊 Returning comparison mode");
    return await createComparisonChain(userMessage, context.userPreferences || {});

  } catch (error) {
    console.error("❌ Error in handleChatQuery:", error.message);
    throw error;
  }
}

// Legacy function for backward compatibility (if needed elsewhere)
export async function getWeekendRecommendation(userQuery) {
  return await handleChatQuery(userQuery, {});
}
