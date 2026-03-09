const express = require('express');
const router = express.Router();
const { searchHybrid } = require('../services/searchService');
const { searchVector } = require('../services/vectorSearchService');
const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL_NAME || 'llama-3.3-70b-versatile';

const CHAT_SYSTEM_PROMPT = `You are PanelPulse AI Assistant — an expert HR analytics chatbot for the PanelPulse platform.

Your role is to help the HR TAG (Talent Acquisition Group) team by:
- Answering questions about panel efficiency scores, dimensions, and evaluations
- Recommending suitable interview panels for specific technology domains
- Identifying patterns in candidate rejection vs probing depth
- Summarizing evaluation trends across panels and candidates
- Providing actionable insights from panel interview data

You have access to real panel evaluation data from the PanelPulse database retrieved via hybrid search (BM25 + vector semantic search).

RESPONSE GUIDELINES:
- Be concise but thorough. Use bullet points for lists, bold for key names/numbers.
- When recommending panels, cite their actual scores and dimension strengths from the context.
- When data is not available in the context, say so clearly rather than hallucinating.
- Format scores as X.X/10. Mention relevant dimensions when comparing panels.
- Keep a professional but approachable tone suited for HR/recruitment teams.
- If the user asks a follow-up, use the conversation history to maintain context.
- Always prioritize data from the "PANEL DATA CONTEXT" section over general knowledge.

PANEL SCORING DIMENSIONS (max scores):
- Mandatory Skill Coverage: 2.5
- Technical Depth: 2.5
- Scenario/Risk Evaluation: 1.0
- Framework Knowledge: 1.0
- Hands-on Validation: 1.0
- Leadership Evaluation: 0.75
- Behavioral Assessment: 0.75
- Interview Structure: 0.5
Total max score: 10.0

Score interpretation: 0-4.9 = Poor, 5-7.9 = Moderate, 8-10 = Good`;

/**
 * Call GROQ API for chat completion
 */
async function callGroqChat(messages) {
  return new Promise((resolve, reject) => {
    if (!GROQ_API_KEY) {
      return reject(new Error('GROQ_API_KEY not configured'));
    }

    const body = JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
      top_p: 0.9,
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || 'GROQ API error'));
          }
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) return reject(new Error('Empty response from GROQ'));
          resolve(content);
        } catch (e) {
          reject(new Error('Failed to parse GROQ response'));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`GROQ request failed: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

/**
 * Format search results into LLM-readable context
 */
function formatContextFromResults(results) {
  if (!results || results.length === 0) {
    return 'No relevant panel evaluation data found for this query.';
  }

  return results.slice(0, 8).map((doc, i) => {
    const lines = [
      `--- Record ${i + 1} ---`,
      doc.job_interview_id ? `Job Interview ID: ${doc.job_interview_id}` : null,
      doc.candidate_name ? `Candidate: ${doc.candidate_name}` : null,
      doc.panel_member_name ? `Panel Member: ${doc.panel_member_name}` : null,
      doc.field_type ? `Field Type: ${doc.field_type}` : null,
    ];

    if (doc.score !== undefined) {
      lines.push(`Relevance Score: ${doc.score}`);
    }
    if (doc.hybrid_score !== undefined) {
      lines.push(`Hybrid Score: ${doc.hybrid_score}`);
    }
    if (doc.preview) {
      lines.push(`Content Preview: ${doc.preview.substring(0, 400)}`);
    }

    return lines.filter(Boolean).join('\n');
  }).join('\n\n');
}

/**
 * POST /api/v1/chat
 * Conversational AI endpoint backed by hybrid search + GROQ LLM
 * Body: { message: string, history: Array<{role: 'user'|'assistant', content: string}> }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'message is required and must be a non-empty string',
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: 'Invalid field',
        details: 'history must be an array',
      });
    }

    const trimmedMessage = message.trim();
    console.log(`[Chat] Incoming message: "${trimmedMessage.substring(0, 80)}"`);

    // Step 1: Hybrid search to retrieve relevant panel data
    let searchResults = [];
    let searchQuery = trimmedMessage;
    let sources = [];

    try {
      const hybridResult = await searchHybrid(trimmedMessage, {
        limit: 10,
        skip: 0,
        bm25Weight: 0.4,
        vectorWeight: 0.6,
        vectorMinScore: 0.25,
      });

      searchResults = hybridResult.results || [];
      sources = searchResults.slice(0, 5).map((r) => ({
        job_interview_id: r.job_interview_id || null,
        candidate_name: r.candidate_name || null,
        panel_member_name: r.panel_member_name || null,
        field_type: r.field_type || null,
        relevance: r.hybrid_score || r.score || null,
      }));

      console.log(`[Chat] Hybrid search returned ${searchResults.length} results`);
    } catch (searchErr) {
      console.warn('[Chat] Hybrid search failed, falling back to vector search:', searchErr.message);

      // Fallback: vector-only search
      try {
        const vectorResult = await searchVector(trimmedMessage, {
          limit: 8,
          skip: 0,
          minScore: 0.25,
        });
        searchResults = vectorResult.results || [];
        sources = searchResults.slice(0, 5).map((r) => ({
          job_interview_id: r.job_interview_id || null,
          candidate_name: r.candidate_name || null,
          panel_member_name: r.panel_member_name || null,
          field_type: r.field_type || null,
          relevance: r.similarity || null,
        }));
        console.log(`[Chat] Vector fallback returned ${searchResults.length} results`);
      } catch (vectorErr) {
        console.warn('[Chat] Vector search also failed:', vectorErr.message);
        // Continue with empty context — LLM will answer from general knowledge
      }
    }

    // Step 2: Format context from search results
    const contextBlock = formatContextFromResults(searchResults);

    // Step 3: Build message array for GROQ
    // Keep last 10 turns of history to stay within token limits
    const recentHistory = history.slice(-10);

    const groqMessages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `PANEL DATA CONTEXT (from hybrid search):\n${contextBlock}`,
      },
      {
        role: 'assistant',
        content: 'I have reviewed the relevant panel evaluation data. I am ready to answer your question.',
      },
      // Inject conversation history
      ...recentHistory.map((turn) => ({
        role: turn.role === 'user' ? 'user' : 'assistant',
        content: turn.content,
      })),
      // Current user message
      { role: 'user', content: trimmedMessage },
    ];

    // Step 4: Call GROQ for AI response
    console.log(`[Chat] Calling GROQ with ${groqMessages.length} messages`);
    const reply = await callGroqChat(groqMessages);
    console.log(`[Chat] GROQ reply length: ${reply.length} chars`);

    return res.status(200).json({
      success: true,
      reply,
      sources,
      searchQuery,
      resultCount: searchResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Chat] Error:', err.message);

    if (err.message.includes('GROQ_API_KEY')) {
      return res.status(503).json({
        error: 'AI service not configured',
        details: 'GROQ API key is missing',
      });
    }

    if (err.message.includes('GROQ')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        details: err.message,
      });
    }

    res.status(500).json({
      error: 'Chat request failed',
      details: err.message,
    });
  }
});

module.exports = router;
