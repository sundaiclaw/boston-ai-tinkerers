const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/data', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'meetup-data.json')));

app.post('/api/match', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' });
    const { goal = 'meet people building useful AI tools', attendees = [], sessions = [] } = req.body || {};
    const prompt = `You are helping someone at the Boston AI Tinkerers meetup. User goal: ${goal}. Attendees: ${JSON.stringify(attendees)}. Sessions: ${JSON.stringify(sessions)}. Return strict JSON only with shape {"headline":"...","recommendedAttendeeIds":["...","..."],"recommendedSessionIds":["...","..."],"reason":"..."}. Pick 2 attendees and 2 sessions.`;
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.sundai.club',
        'X-Title': 'Boston AI Tinkerers'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are concise, optimistic, and return valid JSON only.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({ error: 'OpenRouter request failed', details });
    }
    const data = await response.json();
    return res.json({ model: OPENROUTER_MODEL, ...JSON.parse(data.choices?.[0]?.message?.content || '{}') });
  } catch (error) {
    return res.status(500).json({ error: 'AI match failed', details: error.message });
  }
});

app.post('/api/ideas', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' });
    const { theme = 'LLM tooling for local communities' } = req.body || {};
    const prompt = `Generate 3 sharp build ideas for the Boston AI Tinkerers meetup. Theme: ${theme}. Return strict JSON only as {"ideas":[{"title":"...","summary":"...","stack":"..."}]}. Keep each summary under 40 words.`;
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.sundai.club',
        'X-Title': 'Boston AI Tinkerers'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are an energizing meetup MC and return valid JSON only.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({ error: 'OpenRouter request failed', details });
    }
    const data = await response.json();
    return res.json({ model: OPENROUTER_MODEL, ...JSON.parse(data.choices?.[0]?.message?.content || '{}') });
  } catch (error) {
    return res.status(500).json({ error: 'AI ideas failed', details: error.message });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true, model: OPENROUTER_MODEL }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Boston AI Tinkerers listening on ${PORT}`));
