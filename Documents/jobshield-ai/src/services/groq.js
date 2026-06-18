import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  console.error('VITE_GROQ_API_KEY is not set in environment variables');
}

// Country-specific scam patterns
const COUNTRY_PATTERNS = {
  Nigeria: "Local scam patterns: impersonation of oil companies (Shell, Chevron, TotalEnergies), government agencies (NNPC, CBN, EFCC), NGOs. Common phrases: 'management trainee', 'graduate trainee', high salaries for entry-level. Often requests NIN, BVN, or guarantors.",
  Kenya: "Local scam patterns: M-Pesa payment requests, impersonation of NGOs and UN agencies, 'data entry' roles with no company address, requests for NHIF/NSSF numbers early.",
  Ghana: "Local scam patterns: oil and mining company impersonation, requests for Ghana Card numbers, 'client service' roles that require upfront training fees.",
  'South Africa': "Local scam patterns: recruiter identity cloning, legitimate job board postings that redirect to WhatsApp, requests for certified copies of ID before interview.",
  "Côte d'Ivoire": "Local scam patterns (French language): cloned international NGO listings, requests for fees described as 'frais de dossier', impersonation of Total Energies and cocoa industry companies.",
  Other: "General scam patterns: requests for payment, personal documents before interview, vague company details, urgency pressure, too-good-to-be-true offers."
};

// Helper function to repair incomplete JSON responses
const repairIncompleteJSON = (jsonStr) => {
  try {
    // If it already parses, return as-is
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (e) {
    // Try to repair common issues
    let repaired = jsonStr.trim();
    
    // Count opening and closing braces/brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing brackets
    if (openBrackets > closeBrackets) {
      repaired += ']'.repeat(openBrackets - closeBrackets);
    }
    
    // Add missing closing braces
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }
    
    // Remove trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[\]}])/g, '$1');
    
    return repaired;
  }
};

// Helper function to call Groq API with retry logic
const callGroqAPI = async (systemPrompt, userPrompt, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 8000
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

    const content = response.data.choices[0].message.content;
    
    // Try to parse JSON, handling potential markdown code blocks and extra text
    let jsonContent = content.trim();
    
    // Remove markdown code blocks
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }
    
    // Try to extract JSON object if there's extra text
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }
    
    // Attempt to repair incomplete JSON (common with truncated responses)
    jsonContent = repairIncompleteJSON(jsonContent);
    
    // Log the content we're trying to parse for debugging
    console.log('Attempting to parse JSON:', jsonContent.substring(0, 200) + '...');
    
    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Content that failed to parse:', jsonContent);
      throw parseError;
    }
    } catch (error) {
      // Handle rate limiting with exponential backoff
      if (error.response?.status === 429 && attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${waitTime/1000}s... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Retry
      }
      
      // If not rate limit or final attempt, throw error
      if (error.response) {
        console.error('Groq API Error:', error.response.data);
        if (error.response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
      } else if (error.message.includes('JSON')) {
        console.error('JSON Parsing Error:', error.message);
      } else {
        console.error('Groq API Error:', error.message);
      }
      throw new Error('Failed to analyze job listing. Please try again.');
    }
  }
};

// PROMPT 1: Scam Detection
export const analyzeScamSignals = async (listingText, country) => {
  const countryPatterns = COUNTRY_PATTERNS[country] || COUNTRY_PATTERNS.Other;
  
  const systemPrompt = `You are a job fraud detection expert trained on African and global job market scam patterns. Return ONLY valid JSON. No preamble. No markdown.`;
  
  const userPrompt = `Analyze this job listing for fraud signals. 
Country context: ${country}

Known ${country} scam patterns: ${countryPatterns}

Return this exact JSON structure:
{
  "signals": {
    "emailMismatch": 0-1,
    "paymentLanguage": 0-1,
    "domainAge": 0-1,
    "urgencyPressure": 0-1,
    "identityVague": 0-1,
    "documentRequest": 0-1
  },
  "flaggedElements": [
    {"signal": "signal name", "evidence": "exact quote from listing", "explanation": "why this is suspicious"}
  ],
  "intentAnalysis": "2 sentences on overall intent pattern detected",
  "whyNotRules": "1 sentence explaining why keyword filtering would miss this specific pattern"
}

Job listing: ${listingText}`;

  return await callGroqAPI(systemPrompt, userPrompt);
};

// PROMPT 2: Application ROI
export const analyzeApplicationROI = async (listingText) => {
  const systemPrompt = `You are a career intelligence analyst. Return ONLY valid JSON. No preamble. No markdown.`;
  
  const userPrompt = `Evaluate the application ROI for this job listing.

Return this exact JSON structure:
{
  "signals": {
    "applicantVolume": 0-1,
    "listingAge": 0-1,
    "skillClarity": 0-1,
    "roleCompanyFit": 0-1,
    "internalCandidateSignal": 0-1
  },
  "worthApplying": true/false,
  "probabilityEstimate": "percentage range e.g. 2-5%",
  "hiddenConsiderations": ["consideration 1", "consideration 2"],
  "improvementTips": ["tip 1", "tip 2", "tip 3"],
  "likelyOutcome": "1 sentence on what realistically happens if they apply"
}

Job listing: ${listingText}`;

  return await callGroqAPI(systemPrompt, userPrompt);
};

// PROMPT 3: Ghost Job Detection (requires web search results)
export const analyzeGhostJobSignals = async (companyName, jobTitle, serperResults) => {
  const systemPrompt = `You are a ghost job investigator. Ghost jobs are real companies posting roles they never intend to fill. Return ONLY valid JSON. No preamble. No markdown.`;
  
  const userPrompt = `Based on this web research about ${companyName}, analyze whether this job posting is likely a ghost job.

Web research findings:
${JSON.stringify(serperResults, null, 2)}

Return this exact JSON structure:
{
  "signals": {
    "repostFrequency": 0-1,
    "headcountRatio": 0-1,
    "recentLayoffs": 0-1,
    "fundingMismatch": 0-1,
    "listingAge": 0-1
  },
  "companyExists": true/false,
  "recentLayoffs": true/false/unknown,
  "openRolesVsHeadcount": "finding",
  "fundingSignal": "finding",
  "ghostRedFlags": [
    {"signal": "signal name", "evidence": "specific finding", "source": "url or 'community data'"}
  ],
  "ghostSummary": "2 sentences plain language"
}`;

  return await callGroqAPI(systemPrompt, userPrompt);
};

// Comparison Analysis for Compare Opportunities feature
export const compareOpportunities = async (analysisA, analysisB) => {
  const systemPrompt = `You are a career decision analyst. Return ONLY valid JSON. No preamble. No markdown.`;
  
  const userPrompt = `Given these two job opportunity analyses, provide a comparative decision simulation.

Opportunity A:
${JSON.stringify(analysisA, null, 2)}

Opportunity B:
${JSON.stringify(analysisB, null, 2)}

Return JSON:
{
  "recommendation": "A" | "B" | "neither" | "both worth pursuing",
  "primaryReason": "1 sentence",
  "tradeoffs": [
    {"factor": "factor name", "advantageGoes": "A" | "B", "explanation": "1 sentence"}
  ],
  "hiddenConsiderations": ["consideration 1", "consideration 2"],
  "likelyOutcomeA": "1 sentence on what realistically happens",
  "likelyOutcomeB": "1 sentence on what realistically happens",
  "whyAIBeatRulesHere": "1 sentence on why this comparison required inference not lookup"
}`;

  return await callGroqAPI(systemPrompt, userPrompt);
};

// Weighted Scoring Engine
export const calculateScores = (scamSignals, ghostSignals, roiSignals, communityReports = null) => {
  // SCAM SCORE calculation
  const scamScore = Math.round(
    (scamSignals.emailMismatch * 0.25 +
     scamSignals.paymentLanguage * 0.30 +
     scamSignals.domainAge * 0.20 +
     (scamSignals.urgencyPressure * 0.15) +
     (scamSignals.identityVague * 0.05) +
     (scamSignals.documentRequest * 0.05)) * 100
  );

  // GHOST SCORE calculation
  const ghostScore = Math.round(
    (ghostSignals.repostFrequency * 0.25 +
     ghostSignals.headcountRatio * 0.25 +
     ghostSignals.recentLayoffs * 0.30 +
     ghostSignals.fundingMismatch * 0.20) * 100
  );

  // ROI SCORE calculation
  const roiScore = Math.round(
    (roiSignals.applicantVolume * 0.30 +
     roiSignals.listingAge * 0.25 +
     roiSignals.skillClarity * 0.25 +
     roiSignals.roleCompanyFit * 0.20) * 100
  );

  // Adjust scores based on community reports
  let adjustedScamScore = scamScore;
  let adjustedGhostScore = ghostScore;
  
  if (communityReports) {
    if (communityReports.scam > 10) adjustedScamScore = Math.min(100, scamScore + 15);
    if (communityReports.ghost > 10) adjustedGhostScore = Math.min(100, ghostScore + 15);
  }

  // Calculate confidence levels
  const getConfidence = (signals) => {
    const strongSignals = Object.values(signals).filter(v => v > 0.6).length;
    if (strongSignals >= 3) return 'HIGH';
    if (strongSignals >= 1) return 'MEDIUM';
    return 'LOW';
  };

  return {
    scamScore: adjustedScamScore,
    ghostScore: adjustedGhostScore,
    roiScore,
    scamConfidence: getConfidence(scamSignals),
    ghostConfidence: getConfidence(ghostSignals),
    roiConfidence: getConfidence(roiSignals)
  };
};

// Generate overall verdict
export const generateVerdict = (scamScore, ghostScore, roiScore) => {
  if (scamScore > 70) {
    return "⛔ High Risk — Proceed With Extreme Caution";
  }
  if (ghostScore > 70) {
    return "⚠️ Likely Ghost Job — Verify Before Applying";
  }
  if (roiScore < 30) {
    return "⏱️ Low Return — Consider Your Time Investment";
  }
  return "✅ Appears Legitimate — Verify Independently";
};

// Made with Bob


// Helper function to call Groq API for chat (returns plain text, not JSON)
const callGroqChatAPI = async (systemPrompt, userPrompt, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return content.trim();

    } catch (error) {
      console.error(`Chat API attempt ${attempt + 1} failed:`, error.message);
      
      if (error.response?.status === 429 || error.message.includes('rate_limit')) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (attempt === retries - 1) {
        throw new Error('Failed to get AI response. Please try again.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Chat with AI about job listing
export const chatWithAI = async (userQuestion, contextData) => {
  const systemPrompt = `You are JobShield AI, a career decision intelligence assistant. You help job seekers understand job opportunities and make informed decisions.

Context about the job listing being discussed:
- Company: ${contextData.company_name || contextData.companyName || 'Unknown'}
- Job Title: ${contextData.job_title || contextData.jobTitle || 'Unknown'}
- Scam Score: ${contextData.scam_score || contextData.scores?.scamScore || 'N/A'}%
- Ghost Job Score: ${contextData.ghost_score || contextData.scores?.ghostScore || 'N/A'}%
- Application ROI Score: ${contextData.roi_score || contextData.scores?.roiScore || 'N/A'}%
- Country: ${contextData.country || 'Unknown'}

Previous conversation:
${contextData.previousMessages?.map(m => `${m.role}: ${m.content}`).join('\n') || 'None'}

Guidelines:
1. Be conversational but professional
2. Reference the specific scores and analysis when relevant
3. Always remind users to verify independently
4. If asked about applying, consider all three scores
5. Provide actionable advice
6. Keep responses concise (2-4 sentences unless more detail is needed)
7. Never make absolute guarantees - use phrases like "appears to", "suggests", "likely"`;

  const userPrompt = userQuestion;

  try {
    const response = await callGroqChatAPI(systemPrompt, userPrompt);
    return response;
  } catch (error) {
    console.error('Chat AI error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};
