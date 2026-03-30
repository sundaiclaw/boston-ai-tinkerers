let data = { sessions: [], attendees: [], themes: [], venue: {}, sponsors: [] };
const els = {
  sessions: document.getElementById('sessions'),
  attendees: document.getElementById('attendees'),
  goal: document.getElementById('goal-input'),
  match: document.getElementById('match-result'),
  ideas: document.getElementById('ideas'),
  model: document.getElementById('model-pill'),
  sessionCount: document.getElementById('session-count'),
  attendeeCount: document.getElementById('attendee-count'),
  venueName: document.getElementById('venue-name'),
  venuePill: document.getElementById('venue-pill'),
  venueBlurb: document.getElementById('venue-blurb'),
  sponsors: document.getElementById('sponsors')
};

function render() {
  els.venueName.textContent = data.venue.name || 'Boston meetup venue';
  els.venuePill.textContent = data.venue.neighborhood || 'Boston';
  els.venueBlurb.textContent = data.venue.blurb || '';
  els.sponsors.innerHTML = (data.sponsors || []).map(name => `<span class="chip">${name}</span>`).join('');
  els.sessionCount.textContent = `${data.sessions.length} sessions`;
  els.attendeeCount.textContent = `${data.attendees.length} attendees`;
  els.sessions.innerHTML = data.sessions.map(session => `
    <article class="card" data-session-id="${session.id}">
      <div class="meta">${session.time} · ${session.tag} · ${session.location}</div>
      <h3>${session.title}</h3>
      <p>${session.desc}</p>
    </article>`).join('');
  els.attendees.innerHTML = data.attendees.map(person => `
    <article class="card" data-attendee-id="${person.id}">
      <div class="meta">${person.focus} · ${person.neighborhood}</div>
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
      <div class="highlight-list">${people.map(name => `<span class="highlight">👤 ${name}</span>`).join('')} ${sessions.map(title => `<span class="highlight">🎤 ${title}</span>`).join('')}</div>
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
document.querySelectorAll('.prompt-chip').forEach(button => button.addEventListener('click', () => {
  els.goal.value = button.getAttribute('data-prompt') || els.goal.value;
}));
fetch('/api/data').then(res => res.json()).then(json => { data = json; render(); });
