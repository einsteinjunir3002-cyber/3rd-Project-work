const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure an API key was provided
const apiKey = process.argv[2] || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("\n❌ Error: Please provide your Gemini API key as an argument or set the GEMINI_API_KEY environment variable.");
  console.error("Usage: node verify_gemini.js <your_api_key>\n");
  process.exit(1);
}

async function verify() {
  console.log("==========================================================================");
  console.log("🚀 STARTING GEMINI INTEGRATION VERIFICATION");
  console.log(`🔑 API Key detected: ${apiKey.substring(0, 6)}...`);
  console.log("==========================================================================");

  let availableModels = [];
  let compatibleModels = [];

  // Step 1: Dynamic Discovery
  try {
    console.log("🤖 [1/3] Fetching available models from https://generativelanguage.googleapis.com/v1beta/models...");
    const discoverRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { timeout: 10000 });
    if (discoverRes.data && discoverRes.data.models) {
      availableModels = discoverRes.data.models;
      compatibleModels = availableModels.filter(m => 
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
      );
      console.log(`✅ Discovered ${availableModels.length} models. ${compatibleModels.length} support generateContent.`);
    }
  } catch (err) {
    console.error("❌ Discovery Failed:", err.message);
    if (err.response) {
      console.error("API Error Body:", err.response.data);
    }
    process.exit(1);
  }

  // Step 2: Fallback & Selection Logic
  let targetModel = 'models/gemini-2.5-flash';
  let finalModel = targetModel;
  let fallbackSelected = false;

  if (compatibleModels.length > 0) {
    const match = compatibleModels.find(m => m.name === targetModel);
    if (match) {
      console.log(`✅ Confirmed model "${targetModel}" exists and supports generateContent.`);
    } else {
      const fallbackModelObj = compatibleModels.find(m => m.name.includes('gemini-2.5-flash')) ||
                               compatibleModels.find(m => m.name.includes('gemini-2.5-pro')) ||
                               compatibleModels[0];
      if (fallbackModelObj) {
        finalModel = fallbackModelObj.name;
        fallbackSelected = true;
        console.warn(`⚠️ Target model "${targetModel}" is unavailable. Fallback model selected: "${finalModel}"`);
      }
    }
  } else {
    console.warn(`⚠️ Compatible models list empty. Proceeding with target model: "${targetModel}"`);
  }

  const sdkModelName = finalModel.startsWith('models/') ? finalModel.substring(7) : finalModel;
  console.log(`🤖 [2/3] Resolved model for SDK: "${sdkModelName}"`);

  // Step 3: Payload Validation & request
  const prompt = "what is democracy";
  console.log(`🤖 [3/3] Validating payload format and querying model "${sdkModelName}" for: "${prompt}"...`);

  if (!sdkModelName || sdkModelName.trim() === '') {
    console.error("❌ Validation Error: Model name is empty.");
    process.exit(1);
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    console.error("❌ Validation Error: Prompt must be a non-empty string.");
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: sdkModelName });
    
    console.log(`🤖 Dispatching content generation request to https://generativelanguage.googleapis.com/v1beta/models/${sdkModelName}:generateContent`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log("==========================================================================");
    console.log("🎉 SUCCESS: Gemini API responded correctly!");
    console.log("--------------------------------------------------------------------------");
    console.log(responseText);
    console.log("==========================================================================");
  } catch (err) {
    console.error("❌ Content Generation Failed:", err.message);
    process.exit(1);
  }
}

verify();
