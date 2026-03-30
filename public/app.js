let data = { sessions: [], attendees: [], themes: [] };
const els = {
  sessions: document.getElementById('sessions'),
  attendees: document.getElementById('attendees'),
  goal: document.getElementById('goal-input'),
  match: document.getElementById('match-result'),
  ideas: document.getElementById('ideas'),
  model: document.getElementById('model-pill')
};

function render() {
  els.sessions.innerHTML = data.sessions.map(session => `
    <article class="card" data-session-id="${session.id}">
      <div class="meta">${session.time} · ${session.tag}</div>
      <h3>${session.title}</h3>
      <p>${session.desc}</p>
    </article>`).join('');
  els.attendees.innerHTML = data.attendees.map(person => `
    <article class="card" data-attendee-id="${person.id}">
      <div class="meta">${person.focus}</div>
      <h3>${person.name}</h3>
      <p><strong>Project:</strong> ${person.project}</p>
      <p><strong>Looking for:</strong> ${person.lookingFor}</p>
    </article>`).join('');
}

async function findMatch() {
  els.model.textContent = 'Thinking';
  els.match.textContent = 'Finding a good meetup path...';
  const response = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal: els.goal.value, attendees: data.attendees, sessions: data.sessions })
  });
  const result = await response.json();
  if (!response.ok) {
    els.model.textContent = 'Error';
    els.match.textContent = result.details || result.error;
    return;
  }
  els.model.textContent = result.model || 'Ready';
  const people = data.attendees.filter(person => (result.recommendedAttendeeIds || []).includes(person.id)).map(person => person.name);
  const sessions = data.sessions.filter(session => (result.recommendedSessionIds || []).includes(session.id)).map(session => session.title);
  els.match.innerHTML = `
    <div class="card match-card">
      <h3>${result.headline}</h3>
      <p>${result.reason}</p>
      <ul>
        <li><strong>People:</strong> ${people.join(', ') || '—'}</li>
        <li><strong>Sessions:</strong> ${sessions.join(', ') || '—'}</li>
      </ul>
    </div>`;
}

async function generateIdeas() {
  els.ideas.textContent = 'Generating build prompts...';
  const theme = data.themes[0] || 'AI meetup demos';
  const response = await fetch('/api/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme })
  });
  const result = await response.json();
  if (!response.ok) {
    els.ideas.textContent = result.details || result.error;
    return;
  }
  els.ideas.innerHTML = (result.ideas || []).map(idea => `
    <article class="card idea-card">
      <div class="meta">${idea.stack}</div>
      <h3>${idea.title}</h3>
      <p>${idea.summary}</p>
    </article>`).join('');
}

document.getElementById('find-match').addEventListener('click', findMatch);
document.getElementById('generate-ideas').addEventListener('click', generateIdeas);
fetch('/api/data').then(res => res.json()).then(json => { data = json; render(); });
