import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import SystemSetting from '../models/SystemSetting';
import User from '../models/User';
import Notification from '../models/Notification';

export interface IAiRequestOptions {
  mode?: string;
  systemInstruction?: string;
}

// Abstraction Interface
export interface IAiProvider {
  generateText(prompt: string, model: string, apiKey: string, options?: IAiRequestOptions): Promise<string>;
}

// 1. Google Gemini Provider
class GeminiProvider implements IAiProvider {
  async generateText(prompt: string, modelName: string, apiKey: string, options?: IAiRequestOptions): Promise<string> {
    // 1. Validate the API key exists
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Gemini API Error: API key is missing or empty.");
    }
    // 2. Validate the request payload format
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error("Gemini API Error: Invalid request payload. Prompt must be a non-empty string.");
    }

    console.log(`🤖 [Gemini API] API Key detected: ${apiKey.substring(0, 6)}...`);
    
    // Default model targets
    let targetModel = modelName || 'gemini-2.5-flash';
    const cleanModelName = targetModel.startsWith('models/') ? targetModel : `models/${targetModel}`;

    let availableModels: any[] = [];
    let compatibleModels: any[] = [];

    // Step 1: Automatic model discovery
    try {
      console.log(`🤖 [Gemini API] Discovering available models at https://generativelanguage.googleapis.com/v1beta/models...`);
      const discoverRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { timeout: 10000 });
      if (discoverRes.data && discoverRes.data.models) {
        availableModels = discoverRes.data.models;
        compatibleModels = availableModels.filter(m => 
          m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );
        console.log(`🤖 [Gemini API] Discovered ${availableModels.length} models. ${compatibleModels.length} support generateContent.`);
      }
    } catch (discoveryErr: any) {
      console.error(`⚠️ [Gemini API Discovery Error] Failed to fetch models list:`, discoveryErr.message || discoveryErr);
    }

    let finalModel = cleanModelName;

    // Step 2: Validate target model and check fallback
    if (compatibleModels.length > 0) {
      const match = compatibleModels.find(m => m.name === cleanModelName);
      if (match) {
        console.log(`🤖 [Gemini API] Confirmed model "${cleanModelName}" exists and supports generateContent.`);
      } else {
        // Find if another name maps
        const partialMatch = compatibleModels.find(m => m.name.endsWith(targetModel));
        if (partialMatch) {
          finalModel = partialMatch.name;
          console.log(`🤖 [Gemini API] Resolved model name to "${finalModel}"`);
        } else {
          // Fallback to first compatible model
          const fallbackModelObj = compatibleModels.find(m => m.name.includes('gemini-2.5-flash')) ||
                                   compatibleModels.find(m => m.name.includes('gemini-2.5-pro')) ||
                                   compatibleModels[0];
          
          if (fallbackModelObj) {
            console.warn(`⚠️ [Gemini API] Model "${cleanModelName}" is unsupported or unavailable. Fallback model selected: "${fallbackModelObj.name}"`);
            finalModel = fallbackModelObj.name;
          }
        }
      }
    } else {
      console.warn(`⚠️ [Gemini API] Model list empty or discovery failed. Using "${cleanModelName}".`);
    }

    // Pass finalModel to genAI.getGenerativeModel
    const genAI = new GoogleGenerativeAI(apiKey);
    const sdkModelName = finalModel.startsWith('models/') ? finalModel.substring(7) : finalModel;

    // 3. Validate the selected model exists / is non-empty
    if (!sdkModelName || sdkModelName.trim() === '') {
      throw new Error("Gemini API Error: Selected model name is invalid or empty.");
    }

    console.log(`🤖 [Gemini API] Dispatching content generation to model "${sdkModelName}"...`);
    console.log(`🤖 [Gemini API] Endpoint URL: https://generativelanguage.googleapis.com/v1beta/models/${sdkModelName}:generateContent`);
    console.log(`🤖 [Gemini API] Payload prompt length: ${prompt.length} chars. System Instruction: ${options?.systemInstruction ? 'Present' : 'None'}`);

    try {
      const model = genAI.getGenerativeModel({
        model: sdkModelName,
        systemInstruction: options?.systemInstruction,
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      console.log(`🤖 [Gemini API] Response received successfully (${responseText.length} characters). Status: OK`);
      return responseText;
    } catch (err: any) {
      console.error(`🤖 [Gemini API Error] Failed generation on model "${sdkModelName}":`, err);
      if (sdkModelName !== 'gemini-2.5-pro' && compatibleModels.length > 0) {
        const proFallback = compatibleModels.find(m => m.name.includes('gemini-2.5-pro'));
        if (proFallback) {
          const proSdkName = proFallback.name.startsWith('models/') ? proFallback.name.substring(7) : proFallback.name;
          console.warn(`⚠️ [Gemini API] Retrying with secondary fallback model "${proSdkName}"...`);
          try {
            const fallbackModel = genAI.getGenerativeModel({
              model: proSdkName,
              systemInstruction: options?.systemInstruction,
            });
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
          } catch (fallbackErr: any) {
            console.error(`🤖 [Gemini API] Fallback model "${proSdkName}" failed:`, fallbackErr);
            throw new Error(`Gemini API Error: ${err.message || err}. Fallback error: ${fallbackErr.message}`);
          }
        }
      }
      throw new Error(`Gemini API Error: ${err.message || err}`);
    }
  }
}

// 2. OpenAI Provider
class OpenAIProvider implements IAiProvider {
  async generateText(prompt: string, modelName: string, apiKey: string, options?: IAiRequestOptions): Promise<string> {
    const openai = new OpenAI({ apiKey });
    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model: modelName || 'gpt-4o-mini',
      messages,
    });

    return completion.choices[0]?.message?.content || '';
  }
}

// 3. OpenRouter Provider (Using standard Axios REST call or OpenAI client structure)
class OpenRouterProvider implements IAiProvider {
  async generateText(prompt: string, modelName: string, apiKey: string, options?: IAiRequestOptions): Promise<string> {
    // OpenRouter can be queried using standard Fetch / Axios API
    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelName || 'google/gemini-2.5-flash:free',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter API
          'X-Title': 'SmartLearn AI LMS',
        },
      }
    );

    return response.data.choices[0]?.message?.content || '';
  }
}

// 4. Groq Provider (Using standard OpenAI SDK with custom baseURL)
class GroqProvider implements IAiProvider {
  async generateText(prompt: string, modelName: string, apiKey: string, options?: IAiRequestOptions): Promise<string> {
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    
    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model: modelName || 'llama3-8b-8192',
      messages,
    });

    return completion.choices[0]?.message?.content || '';
  }
}

// 5. Together AI Provider (Using standard OpenAI SDK with custom baseURL)
class TogetherAIProvider implements IAiProvider {
  async generateText(prompt: string, modelName: string, apiKey: string, options?: IAiRequestOptions): Promise<string> {
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.together.xyz/v1',
    });

    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model: modelName || 'meta-llama/Llama-3-8b-chat-hf',
      messages,
    });

    return completion.choices[0]?.message?.content || '';
  }
}

// Map of concrete provider strategies
const providers: Record<string, IAiProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
  openrouter: new OpenRouterProvider(),
  groq: new GroqProvider(),
  together: new TogetherAIProvider(),
};

// Default models for fallback chain
const defaultModels: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  openrouter: 'google/gemini-2.5-flash:free',
  groq: 'llama3-8b-8192',
  together: 'meta-llama/Llama-3-8b-chat-hf',
};

// Main AI Service
export class AiService {
  /**
   * Retrieves or initializes system settings
   */
  static async getSettings() {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting({
        siteName: 'SmartLearn AI',
        activeAiProvider: 'groq',
        activeAiModel: 'llama3-8b-8192',
      });
      await settings.save();
    }
    return settings;
  }

  /**
   * Resolves key for a provider, checking DB then environment variables
   */
  static getApiKey(settings: any, provider: string): string {
    switch (provider) {
      case 'gemini':
        return settings.geminiApiKey || process.env.GEMINI_API_KEY || '';
      case 'openai':
        return settings.openaiApiKey || process.env.OPENAI_API_KEY || '';
      case 'openrouter':
        return settings.openrouterApiKey || process.env.OPENROUTER_API_KEY || '';
      case 'groq':
        return settings.groqApiKey || process.env.GROQ_API_KEY || '';
      case 'together':
        return settings.togetherApiKey || process.env.TOGETHER_API_KEY || '';
      default:
        return '';
    }
  }

  /**
   * Generates text with automatic fallback
   */
  static async generateText(prompt: string, options?: IAiRequestOptions): Promise<string> {
    const settings = await this.getSettings();
    const provider = settings.activeAiProvider || 'groq';
    const apiKey = this.getApiKey(settings, provider);
    const model = settings.activeAiModel || defaultModels[provider];
    const strategy = providers[provider];

    console.log(`🤖 [AI Service] Active Provider: "${provider}", Model: "${model}". API Key Loaded: ${!!apiKey}`);

    if (apiKey) {
      try {
        console.log(`🤖 [AI Service] Routing request to strategy for provider "${provider}" using model "${model}"...`);
        const text = await strategy.generateText(prompt, model, apiKey, options);

        // Update successful stats
        await SystemSetting.updateOne(
          { _id: settings._id },
          { $inc: { [`apiUsageStats.${provider}.requests`]: 1 } }
        );

        console.log(`🤖 [AI Service] Request succeeded on provider "${provider}".`);
        return text;
      } catch (err: any) {
        console.error(`⚠️ [AI Service] Request failed using configured key for "${provider}":`, err.message);

        // Update error stats
        await SystemSetting.updateOne(
          { _id: settings._id },
          { $inc: { [`apiUsageStats.${provider}.errors`]: 1 } }
        );

        // Log error and notify admins
        await this.notifyAdmins(provider, err.message);
        
        // Propagate error directly: do NOT fallback to keyless or mock responses if key exists!
        throw err;
      }
    }

    // Keyless Fallback (only activates when no valid API key exists)
    console.log(`🔌 [AI Service] No API key configured. Activating keyless fallback mode...`);
    try {
      console.log(`🔌 [AI Service] Querying keyless Pollinations AI provider...`);
      const response = await axios.post(
        'https://text.pollinations.ai/',
        {
          messages: [
            { role: 'system', content: options?.systemInstruction || 'You are an elite academic AI assistant.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        },
        { timeout: 15000 }
      );
      if (response.data) {
        console.log(`🔌 [AI Service] Keyless Fallback Success.`);
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      }
      throw new Error('Received empty response from keyless fallback.');
    } catch (fallbackErr: any) {
      console.error('⚠️ [AI Service] Keyless fallback failed:', fallbackErr.message);
      throw new Error(`Keyless AI Fallback Failed: ${fallbackErr.message || fallbackErr}`);
    }
  }

  /**
   * Helper to write system notifications directly to admin user accounts
   */
  private static async notifyAdmins(provider: string, errorMessage: string) {
    try {
      const admins = await User.find({ role: 'admin' });
      const text = `[AI Failover Alert] AI Provider "${provider}" failed. Error: "${errorMessage}". System dynamically routed request to fallback provider.`;
      
      await Promise.all(
        admins.map((admin) => {
          const notif = new Notification({
            userId: admin._id,
            text,
          });
          return notif.save();
        })
      );
    } catch (err) {
      console.error('Failed to dispatch alert notifications to admin accounts:', err);
    }
  }

  /**
   * Utility to test connectivity of a specific provider
   */
  static async testConnection(
    provider: 'gemini' | 'openai' | 'openrouter' | 'groq' | 'together',
    apiKey: string,
    modelName?: string
  ): Promise<boolean> {
    const testPrompt = 'Respond with "pong".';
    const model = modelName || defaultModels[provider];
    const strategy = providers[provider];

    if (!apiKey) {
      throw new Error(`API key is empty or undefined for provider "${provider}".`);
    }

    try {
      console.log(`🔌 [AI Service Test] Testing connection to "${provider}" using model "${model}"...`);
      const res = await strategy.generateText(testPrompt, model, apiKey);
      const isSuccessful = res.toLowerCase().includes('pong') || res.length > 0;
      console.log(`🔌 [AI Service Test] Connection successful: ${isSuccessful}`);
      return isSuccessful;
    } catch (err: any) {
      console.error(`🔌 [AI Service Test] Connection failed:`, err);
      throw err;
    }
  }
}
