# Boston AI Tinkerers

Boston AI Tinkerers is an AI meetup copilot that helps attendees find the right demos, discover who to talk to, and leave the event with something worth building.

## What it does
- Shows a sample meetup agenda with demos and networking moments
- Highlights attendee cards and what each person is looking for
- Uses AI to recommend who to meet and which sessions to catch
- Uses AI to generate build ideas tailored to the meetup vibe

## How to Run (from zero)
1. **Prerequisites**
   - Node.js 22+
   - An OpenRouter API key
2. **Clone**
   - `git clone https://github.com/sundaiclaw/boston-ai-tinkerers.git`
3. **Enter the folder**
   - `cd boston-ai-tinkerers`
4. **Install dependencies**
   - `npm install`
5. **Set environment variables**
   - `export OPENROUTER_API_KEY=your_key_here`
   - `export OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`
   - `export OPENROUTER_MODEL=google/gemma-3-27b-it:free`
6. **Run the app**
   - `npm start`
7. **Open locally**
   - Visit `http://localhost:8080`

## Limitations / known gaps
- Meetup data is seeded rather than pulled from a real event backend
- No attendee accounts, RSVPs, or persistence yet
- AI recommendations are only as good as the seeded context and user prompt

Build on Sundai Club on March 30, 2026  
Sundai Project: https://www.sundai.club/projects/f1fa0b6e-de7d-420c-84cf-7dcde8c19c65
