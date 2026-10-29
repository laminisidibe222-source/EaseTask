// src/lib/analysis.js

export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function analyzeLand(imageUrl, { fileName }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.")
  }

  // Extract the base64 data and mime type from the data URL
  const base64Data = imageUrl.split(',')[1]
  const mimeType = imageUrl.split(';')[0].split(':')[1]

  const prompt = `
    You are an expert agronomist and soil scientist. Analyze this image of a field.
    Provide a realistic, honest assessment of the soil and crops visible.
    You MUST respond with ONLY a raw JSON object (no markdown, no backticks). Use this exact structure:
    {
      "recommendedCrop": "Name of the best crop to plant here",
      "score": 75, // A number from 0 to 100 representing overall soil/land fertility
      "fertility": "Good", // Must be one of: "Excellent", "Good", "Average", "Poor"
      "soilType": "Loamy", // E.g., Clay, Sandy, Loamy, Silt
      "moisture": "Moderate", // E.g., Dry, Moderate, Wet
      "organicMatter": "Low", // E.g., Low, Medium, High
      "phEstimate": "6.5", // Estimate the pH level
      "analysisSummary": "A 2-sentence summary of what you see in the image and why you recommend this crop.",
      "actionPlan": [
        "Step 1 for the farmer to take",
        "Step 2 for the farmer to take"
      ]
    }
  `

  try {
    // src/lib/analysis.js

    // ...
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      }
    )
    // ...
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API Error:", errorData)
      throw new Error("Failed to analyze image")
    }

    const data = await response.json()
    const rawText = data.candidates[0].content.parts[0].text
    
    // Parse the JSON response
    const result = JSON.parse(rawText)
    
    return result

  } catch (error) {
    console.error("Analysis Error:", error)
    // If the API fails, return a graceful fallback so the UI doesn't crash
    return {
      recommendedCrop: "Analysis Unavailable",
      score: 0,
      fertility: "Unknown",
      soilType: "Unknown",
      moisture: "Unknown",
      organicMatter: "Unknown",
      phEstimate: "Unknown",
      analysisSummary: "We could not analyze this image. Please try a clearer photo in daylight.",
      actionPlan: ["Ensure the photo is clear and well-lit.", "Try again."]
    }
  }
}