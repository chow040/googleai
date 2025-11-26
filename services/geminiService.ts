
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { EquityReport } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helper to remove citation markers like [1], [12], [2, 3] from text
const cleanText = (text: string | undefined): string => {
  if (!text) return "";
  return text.replace(/\[\d+(?:,\s*\d+)*\]/g, '').trim();
};

export const chatWithGemini = async (
  report: EquityReport, 
  messageHistory: { role: 'user' | 'model', text: string }[],
  userNotes?: string, 
  userThesis?: string
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing.");
  }

  const contextSummary = `
    STOCK ANALYSIS CONTEXT:
    Company: ${report.companyName} (${report.ticker})
    Price: ${report.currentPrice} (${report.priceChange})
    Verdict: ${report.verdict}
    Rocket Score: ${report.rocketScore}/100
    Summary: ${report.summary}
    Bull Case: ${report.scenarioAnalysis?.bull.price}
    Bear Case: ${report.scenarioAnalysis?.bear.price}
    Short Term Factors: ${report.shortTermFactors.positive.map(f => f.title).join(', ')}
    Risks: ${report.shortTermFactors.negative.map(f => f.title).join(', ')}
    
    USER'S NOTES (The user has written this in their scratchpad):
    "${userNotes || 'No notes yet.'}"

    USER'S INVESTMENT THESIS:
    "${userThesis || 'No thesis defined yet.'}"
  `;

  const systemInstruction = `
  You are 'Ultramagnus', an elite Wall Street equity research assistant. 
  Your goal is to help the user understand the stock report for ${report.ticker}.
  
  RULES:
  1. Use the provided STOCK ANALYSIS CONTEXT to answer questions.
  2. If the user asks about their notes or thesis, refer to the USER'S NOTES section.
  3. Keep answers concise, punchy, and professional (financial analyst persona).
  4. If asked for real-time news not in the report, use the googleSearch tool.
  5. Do not hallucinate data not present in the context or found via search.
  6. Format responses with clean Markdown (bolding key figures).
  `;

  const lastTurn = messageHistory[messageHistory.length - 1];
  
  const prompt = `
  ${contextSummary}

  CHAT HISTORY:
  ${messageHistory.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Ultramagnus'}: ${m.text}`).join('\n')}

  USER'S NEW QUESTION:
  "${lastTurn.text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ]
      }
    });
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to communicate with AI.");
  }
};

export const generateEquityReport = async (ticker: string): Promise<EquityReport> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const prompt = `
  You are a world-class Wall Street equity research analyst known for discovering multi-bagger stocks.
  
  Perform a deep-dive analysis on the stock ticker: ${ticker}.
  
  Use Google Search to find the latest real-time price, financial data, price history, recent news, earnings call transcripts, upcoming events, and DIRECT COMPETITORS.
  Look for publicly reported insider transactions and short interest data.
  Construct a 1-YEAR SCENARIO ANALYSIS (Bear/Base/Bull).
  
  Also, analyze the historical sentiment from approximately 3-6 months ago to determine a "Previous Verdict" and identify WHAT CHANGED to cause the current verdict.

  Return the analysis as a VALID JSON object wrapped in a markdown code block (\`\`\`json ... \`\`\`).
  If specific data (like exact insider trades) is not available, use "N/A" or reasonable estimates based on available context. DO NOT refuse to generate the report.
  
  The JSON structure must strictly match this format:
  {
    "companyName": string,
    "ticker": string,
    "currentPrice": string, // e.g. "$150.25"
    "priceChange": string, // e.g. "+1.2%" or "-0.5%" (Latest daily change)
    "marketCap": string, // e.g. "$2.5T"
    "peRatio": string, // e.g. "35.4" or "N/A"
    "dayHigh": string, // e.g. "$152.00"
    "dayLow": string, // e.g. "$148.50"
    "week52High": string, // e.g. "$180.00"
    "week52Low": string, // e.g. "$120.00"
    "priceTarget": string, // e.g. "$175.00" - A realistic 1-year price target.
    "priceTargetRange": string, // e.g. "$160.00 - $190.00"
    "priceTargetModel": {
       "estimatedEPS": string,
       "targetPE": string,
       "growthRate": string,
       "logic": string
    },
    "scenarioAnalysis": {
       "bear": { "label": "Bear", "price": string, "logic": string, "probability": string }, // e.g. "20%"
       "base": { "label": "Base", "price": string, "logic": string, "probability": string }, // e.g. "50%"
       "bull": { "label": "Bull", "price": string, "logic": string, "probability": string }  // e.g. "30%"
    },
    "summary": string,
    "rocketScore": number, // 0-100
    "rocketReason": string,
    "financialHealthScore": number, // 0-100
    "financialHealthReason": string,
    "moatAnalysis": {
       "moatRating": "Wide" | "Narrow" | "None",
       "moatSource": string, // e.g. "Network Effect", "Switching Costs", "Intangibles"
       "rationale": string
    },
    "history": {
       "previousDate": string, // e.g. "Aug 2024" (approx 3-6 months ago)
       "previousVerdict": "BUY" | "HOLD" | "SELL",
       "changeRationale": ["string", "string"] // Bullet points explaining what changed (e.g. "Guidance Cut", "New Product Launch")
    },
    "shortTermFactors": {
      "positive": [ { "title": string, "detail": string } ],
      "negative": [ { "title": string, "detail": string } ]
    },
    "longTermFactors": {
      "positive": [ { "title": string, "detail": string } ],
      "negative": [ { "title": string, "detail": string } ]
    },
    "upcomingEvents": [
       { "date": string, "event": string, "impact": "High" | "Medium" | "Low" }
    ],
    "recentNews": [
      { "headline": string, "date": string }
    ],
    "earningsCallAnalysis": {
      "sentiment": "Bullish" | "Neutral" | "Bearish",
      "summary": "string",
      "keyTakeaways": ["string", "string"]
    },
    "overallSentiment": {
       "score": number, 
       "label": "Bullish" | "Neutral" | "Bearish",
       "summary": string
    },
    "tags": string[],
    "peers": [
      {
        "ticker": string,
        "name": string,
        "marketCap": string,
        "peRatio": string,
        "revenueGrowth": string,
        "netMargin": string
      }
    ],
    "financials": [ // Last 4 years
      { 
        "year": "2021", 
        "revenue": number, 
        "grossProfit": number,
        "operatingIncome": number,
        "netIncome": number,
        "eps": number,
        "cashAndEquivalents": number,
        "totalDebt": number,
        "shareholderEquity": number,
        "operatingCashFlow": number,
        "capitalExpenditure": number,
        "freeCashFlow": number 
      },
      ...
    ],
    "priceHistory": [ // Last 12 months REQUIRED
      { "month": "Jan", "price": number },
      ...
    ],
    "insiderActivity": [
      {
         "insiderName": string,
         "role": string,
         "transactionDate": string,
         "transactionType": "Buy" | "Sell",
         "shares": string,
         "value": string
      }
    ],
    "riskMetrics": {
       "beta": string,
       "shortInterestPercentage": string,
       "shortInterestRatio": string,
       "volatility": string
    },
    "institutionalSentiment": string,
    "valuation": string,
    "verdict": "BUY" | "HOLD" | "SELL",
    "verdictReason": string
  }
  
  Ensure 'revenue' and other financial metrics are raw numbers (e.g., 150.5 for 150.5 Billion - keep scale consistent).
  IMPORTANT: 'priceHistory' MUST contain exactly 12 data points representing the last 12 months.
  IMPORTANT: In scenarioAnalysis, estimate the 'probability' string for each case based on market consensus and risk, summing to approximately 100%.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ]
      }
    });

    const text = response.text || '';
    
    // Extract Sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((source: any) => source !== null);

    let jsonString = '';
    
    // 1. Try extracting from markdown code blocks with relaxed regex (allows whitespace)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    } else {
      // 2. Fallback: Find the outermost JSON object boundaries
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        jsonString = text.substring(firstOpen, lastClose + 1);
      }
    }

    if (!jsonString) {
      console.error("Gemini Response Raw Output:", text);
      // Check if text is empty and log it.
      if (!text) {
        throw new Error("Analysis failed: The AI model returned an empty response. This is often due to safety filters or lack of search results.");
      }
      throw new Error("Failed to parse analysis report format: No JSON object found in the response.");
    }

    const reportData = JSON.parse(jsonString) as EquityReport;

    // Attach sources to the report object
    reportData.sources = sources;
    
    // Inject Report Date
    reportData.reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // --- CLEANING STEP ---
    reportData.summary = cleanText(reportData.summary);
    reportData.rocketReason = cleanText(reportData.rocketReason);
    reportData.financialHealthReason = cleanText(reportData.financialHealthReason);
    reportData.verdictReason = cleanText(reportData.verdictReason);
    reportData.valuation = cleanText(reportData.valuation);

    if (reportData.earningsCallAnalysis) {
      reportData.earningsCallAnalysis.summary = cleanText(reportData.earningsCallAnalysis.summary);
      if (Array.isArray(reportData.earningsCallAnalysis.keyTakeaways)) {
        reportData.earningsCallAnalysis.keyTakeaways = reportData.earningsCallAnalysis.keyTakeaways.map(cleanText);
      } else {
        reportData.earningsCallAnalysis.keyTakeaways = [];
      }
    }
    
    if (reportData.overallSentiment) {
      reportData.overallSentiment.summary = cleanText(reportData.overallSentiment.summary);
    }
    
    if (reportData.shortTermFactors) {
      reportData.shortTermFactors.positive = (reportData.shortTermFactors.positive || []).map(item => ({
        title: cleanText(item?.title),
        detail: cleanText(item?.detail)
      }));
      reportData.shortTermFactors.negative = (reportData.shortTermFactors.negative || []).map(item => ({
        title: cleanText(item?.title),
        detail: cleanText(item?.detail)
      }));
    } else {
      reportData.shortTermFactors = { positive: [], negative: [] };
    }
    
    if (reportData.longTermFactors) {
      reportData.longTermFactors.positive = (reportData.longTermFactors.positive || []).map(item => ({
        title: cleanText(item?.title),
        detail: cleanText(item?.detail)
      }));
      reportData.longTermFactors.negative = (reportData.longTermFactors.negative || []).map(item => ({
        title: cleanText(item?.title),
        detail: cleanText(item?.detail)
      }));
    } else {
      reportData.longTermFactors = { positive: [], negative: [] };
    }

    if (reportData.priceTargetModel) {
      reportData.priceTargetModel.logic = cleanText(reportData.priceTargetModel.logic);
    }
    
    if (reportData.scenarioAnalysis) {
       reportData.scenarioAnalysis.bear.logic = cleanText(reportData.scenarioAnalysis.bear.logic);
       reportData.scenarioAnalysis.base.logic = cleanText(reportData.scenarioAnalysis.base.logic);
       reportData.scenarioAnalysis.bull.logic = cleanText(reportData.scenarioAnalysis.bull.logic);
    }

    if (reportData.moatAnalysis) {
        reportData.moatAnalysis.rationale = cleanText(reportData.moatAnalysis.rationale);
    }

    if (reportData.history) {
        reportData.history.changeRationale = (reportData.history.changeRationale || []).map(cleanText);
    }

    if (Array.isArray(reportData.insiderActivity)) {
      reportData.insiderActivity = reportData.insiderActivity.map(item => ({
        ...item,
        insiderName: cleanText(item?.insiderName)
      }));
    } else {
      reportData.insiderActivity = [];
    }

    // Fallback for arrays to prevent map errors
    reportData.peers = Array.isArray(reportData.peers) ? reportData.peers : [];
    reportData.financials = Array.isArray(reportData.financials) ? reportData.financials : [];
    reportData.priceHistory = Array.isArray(reportData.priceHistory) ? reportData.priceHistory : [];
    reportData.upcomingEvents = Array.isArray(reportData.upcomingEvents) ? reportData.upcomingEvents : [];
    reportData.recentNews = Array.isArray(reportData.recentNews) ? reportData.recentNews : [];

    return reportData;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
