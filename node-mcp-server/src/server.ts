import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

const PORT = process.env.PORT || 3001; // Server port
const defaultProvider = process.env.AI_PROVIDER || 'groq'; // Default AI provider

/**
 * callAI - Sends a prompt to the selected AI provider and returns the response.
 *
 * model:        The AI model to use (e.g., 'meta-llama/llama-4-scout-17b-16e-instruct' for Groq, 'gpt-4' for OpenAI).
 * systemPrompt: An optional string that sets the context or instructions for the AI (sent as a message with role 'system').
 * role:         The role of the message sender, either 'system' (for instructions/context) or 'user' (for the main prompt).
 * content:      The actual text content of each message, either the systemPrompt or userPrompt.
 * temperature:  Controls randomness/creativity of the AI output (higher = more random, lower = more focused).
 */
const callAI = async (provider: string, systemPrompt: string, userPrompt: string) => {
  console.log(`[callAI] provider: ${provider}`);
  console.log(`[callAI] systemPrompt: ${systemPrompt}`);
  console.log(`[callAI] userPrompt: ${userPrompt}`);

  if (provider === 'groq') {
    try {
      console.log('[callAI] Sending request to Groq...');
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions', // Groq API endpoint
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Groq model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), // Add system prompt if present
            { role: 'user', content: userPrompt } // User prompt
          ],
          temperature: 0.7 // Sampling temperature
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Groq API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] Groq response:', res.data);
      return res.data.choices?.[0]?.message?.content; // Return AI response content
    } catch (err: any) {
      console.error('[callAI] Groq error:', err?.response?.data || err);
      throw err;
    }
  }

  if (provider === 'openai') {
    try {
      console.log('[callAI] Sending request to OpenAI...');
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions', // OpenAI API endpoint
        {
          model: 'gpt-4', // OpenAI model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`, // OpenAI API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] OpenAI response:', res.data);
      return res.data.choices?.[0]?.message?.content;
    } catch (err) {
      console.error('[callAI] OpenAI error:', err);
      throw err;
    }
  }

  if (provider === 'deepseek') {
    try {
      console.log('[callAI] Sending request to DeepSeek...');
      const res = await axios.post(
        'https://api.deepseek.com/v1/chat/completions', // DeepSeek API endpoint
        {
          model: 'deepseek-chat', // DeepSeek model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, // DeepSeek API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] DeepSeek response:', res.data);
      return res.data.choices?.[0]?.message?.content;
    } catch (err: any) {
      console.error('[callAI] DeepSeek error:', err?.response?.data || err);
      throw err;
    }
  }

  if (provider === 'gemini') {
    try {
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${userPrompt}`
        : userPrompt;
      console.log('[callAI] Sending request to Gemini...');
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, // Gemini API endpoint
        {
          contents: [{ parts: [{ text: fullPrompt }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      console.log('[callAI] Gemini response:', res.data);
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text || ''; // Return Gemini response content
    } catch (err: any) {
      console.error('[callAI] Gemini error:', err?.response?.data || err);
      throw err;
    }
  }

  throw new Error('Unsupported provider'); // If provider is not recognized
};

// --- /mcp/text-enhancement ---
app.post('/mcp/text-enhancement', async (req, res) => {
  const { text, provider = defaultProvider } = req.body; // Get text and provider from request
  console.log('[POST /mcp/text-enhancement] provider:', provider, 'text:', text);

  try {
    const systemPrompt =
      'Enhance this business proposal text to be more professional and compelling. Keep the original meaning but improve clarity and impact.'; // System prompt for enhancement
    const result = await callAI(provider, systemPrompt, text); // Call AI provider

    res.json({ success: true, enhancedText: result }); // Send enhanced text to client
  } catch (err: any) {
    console.error('[POST /mcp/text-enhancement] Error:', err?.response?.data || err);
    res.status(500).json({ success: false, error: 'Failed to enhance text' }); // Error response
  }
});

// --- /mcp/generate-html ---
app.post('/mcp/generate-html', async (req, res) => {
  const { proposal, provider = defaultProvider } = req.body; // Get proposal and provider from request
  console.log('[POST /mcp/generate-html] provider:', provider, 'proposal:', proposal);

  try {
    const systemPrompt = `Generate a professional HTML template for a business proposal. Use this JSON data: ${JSON.stringify(proposal)}`; // System prompt for HTML generation
    const result = await callAI(provider, systemPrompt, ''); // Call AI provider

    res.json({ success: true, html: result }); // Send generated HTML to client
  } catch (err: any) {
    console.error('[POST /mcp/generate-html] Error:', err?.response?.data || err);
    res.status(500).json({ success: false, error: 'Failed to generate HTML' }); // Error response
  }
});

app.listen(PORT, () => {
  console.log(`✅ MCP server running on http://localhost:${PORT}`); // Server started
});
