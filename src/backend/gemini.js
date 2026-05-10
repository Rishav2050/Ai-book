import { fetchBookDetailsFromInternet } from './googleBooks';

const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;

const getPersonaContext = (persona) => {
  switch(persona) {
    case 'Academic Scholar': return "You are a distinguished, intellectual scholar. Use sophisticated vocabulary and focus on deep, analytical insights.";
    case 'Sarcastic & Witty': return "You are a sarcastic, witty, and slightly cynical book critic. You give good recommendations but with a dry, humorous, and sassy tone.";
    case 'Enthusiastic Geek': return "You are an incredibly energetic, geeky fan! Use lots of exclamation marks, emojis, and show massive excitement for everything!";
    default: return "You are an expert, helpful, and concise librarian AI.";
  }
}

// Helper to safely extract JSON object or array from Gemini's response
const extractJson = (text) => {
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');

  let firstIndex = -1;
  if (firstBrace !== -1 && firstBracket !== -1) firstIndex = Math.min(firstBrace, firstBracket);
  else firstIndex = Math.max(firstBrace, firstBracket);

  let lastIndex = -1;
  if (lastBrace !== -1 && lastBracket !== -1) lastIndex = Math.max(lastBrace, lastBracket);
  else lastIndex = Math.max(lastBrace, lastBracket);

  if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
    return text.substring(firstIndex, lastIndex + 1);
  }
  return text;
};

// Helper to handle API requests safely
const callGemini = async (prompt) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Gemini API Error: ${data.error?.message || JSON.stringify(data)}`);
  }
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid response structure: " + JSON.stringify(data));
  }
  
  const rawText = data.candidates[0].content.parts[0].text;
  const jsonText = extractJson(rawText);
  
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse JSON:", jsonText);
    throw new Error("JSON Parse Error: " + err.message);
  }
};

export const generateRecommendations = async (readHistory, persona = 'Helpful') => {
  if (readHistory.length === 0) return [];
  const historyTitles = readHistory.map(b => `"${b.title}" by ${b.author}`).join(', ');
  
  const prompt = `
    ${getPersonaContext(persona)}
    The user read: ${historyTitles}.
    Provide a comprehensive, extensive list of REAL books they haven't read but would love.
    Return STRICTLY a JSON array. Do not include markdown formatting.
    [{"title": "...", "author": "...", "reason": "..."}]
  `;

  try {
    const parsed = await callGemini(prompt);
    const arrayData = Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || [];
    
    return Promise.all(arrayData.map(async (rec) => {
      const bd = await fetchBookDetailsFromInternet(rec.title, rec.author);
      return { ...bd, aiReason: rec.reason };
    }));
  } catch (err) {
    console.error("Recommendations Error:", err);
    throw err;
  }
};

export const searchBooks = async (query, persona = 'Helpful') => {
  if (!query.trim()) return [];

  const prompt = `
    ${getPersonaContext(persona)}
    Provide a comprehensive list of all the best real books for this query: "${query}".
    Return STRICTLY a JSON array. Do not include markdown formatting.
    [{"title": "...", "author": "...", "matchScore": "95%", "reason": "..."}]
  `;

  try {
    const parsed = await callGemini(prompt);
    const arrayData = Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray) || [];
    
    return Promise.all(arrayData.map(async (res) => {
      const bd = await fetchBookDetailsFromInternet(res.title, res.author);
      return { ...bd, aiReason: res.reason, matchScore: res.matchScore };
    }));
  } catch (err) {
    console.error("Search Error:", err);
    throw err;
  }
};

export const generateRoadmap = async (topic, persona = 'Helpful') => {
  if (!topic.trim()) return null;

  const prompt = `
    ${getPersonaContext(persona)}
    The user wants to learn about "${topic}". Create a 3-step reading roadmap (Beginner, Intermediate, Advanced).
    For each step, recommend ONE definitive real book.
    Return STRICTLY a JSON object. Do not include markdown formatting.
    {
      "intro": "A short engaging intro message in your persona.",
      "steps": [
        { "level": "Beginner", "title": "...", "author": "...", "explanation": "..." },
        { "level": "Intermediate", "title": "...", "author": "...", "explanation": "..." },
        { "level": "Advanced", "title": "...", "author": "...", "explanation": "..." }
      ]
    }
  `;

  try {
    let parsed = await callGemini(prompt);

    // Safety normalizations
    if (!parsed.steps) {
      if (Array.isArray(parsed)) {
        parsed = { intro: "Here is your curated reading roadmap.", steps: parsed };
      } else {
        const possibleArrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
        if (possibleArrayKey) parsed.steps = parsed[possibleArrayKey];
        else throw new Error("Missing steps array in response.");
      }
    }
    if (!parsed.intro) parsed.intro = "Here is your curated reading roadmap.";

    const enrichedSteps = await Promise.all(parsed.steps.map(async step => {
      const bd = await fetchBookDetailsFromInternet(step.title, step.author);
      return { ...step, ...bd, aiReason: step.explanation };
    }));
    parsed.steps = enrichedSteps;

    return parsed;
  } catch (err) {
    console.error("Roadmap Error:", err);
    throw err;
  }
};

export const getBookSummary = async (book, persona = 'Helpful') => {
  const prompt = `
    ${getPersonaContext(persona)}
    Provide a comprehensive summary of the book "${book.title}" by ${book.author}.
    Return STRICTLY a JSON object. Do not include markdown formatting.
    {
      "summary": "A 2-3 paragraph detailed summary in your persona...",
      "takeaways": ["Key point 1", "Key point 2", "Key point 3"]
    }
  `;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error("Summary Error:", err);
    throw err;
  }
};

export const chatWithLibrarian = async (messages, readHistory, persona = 'Helpful') => {
  const apiKey = getApiKey();
  if (!apiKey) return "Missing API Key.";

  const historyContext = readHistory.map(b => b.title).join(', ');
  const systemPrompt = `${getPersonaContext(persona)} The user's reading history: ${historyContext || 'None yet'}.`;
  
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood.' }] },
    ...messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  ];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Chat failed");
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Chat Error:", err);
    throw err;
  }
};
