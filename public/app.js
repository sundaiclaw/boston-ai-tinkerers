const state = {
  data: null
};

const elements = {
  heroTitle: document.getElementById('hero-title'),
  heroSubtitle: document.getElementById('hero-subtitle'),
  heroMeta: document.getElementById('hero-meta'),
  communityNote: document.getElementById('community-note'),
  heroStats: document.getElementById('hero-stats'),
  schedule: document.getElementById('schedule'),
  sessionCount: document.getElementById('session-count'),
  highlights: document.getElementById('highlights'),
  attendees: document.getElementById('attendees'),
  attendeeCount: document.getElementById('attendee-count'),
  cityHeadline: document.getElementById('city-headline'),
  citySummary: document.getElementById('city-summary'),
  cityNeighborhoods: document.getElementById('city-neighborhoods'),
  cityTransit: document.getElementById('city-transit'),
  norms: document.getElementById('norms'),
  collaborationPrompts: document.getElementById('collaboration-prompts'),
  promptList: document.getElementById('prompt-list'),
  goalInput: document.getElementById('goal-input'),
  matchForm: document.getElementById('match-form'),
  matchStatus: document.getElementById('match-status'),
  matchResult: document.getElementById('match-result'),
  matchSource: document.getElementById('match-source'),
  themeInput: document.getElementById('theme-input'),
  ideasForm: document.getElementById('ideas-form'),
  ideasStatus: document.getElementById('ideas-status'),
  ideasResult: document.getElementById('ideas-result'),
  ideasSource: document.getElementById('ideas-source')
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return replacements[character] || character;
  });
}

function renderPills(values = []) {
  return values.map((value) => `<span class="pill">${escapeHtml(value)}</span>`).join('');
}

function renderListItems(values = [], emptyMessage) {
  if (!values.length) {
    return `<li class="empty-list-item">${escapeHtml(emptyMessage)}</li>`;
  }

  return values.map((value) => `<li>${escapeHtml(value)}</li>`).join('');
}

function renderSkeletonCards(count, cardClass, lineClasses = ['skeleton-line-short', '', '']) {
  return Array.from({ length: count }, () => {
    const lines = lineClasses
      .map((lineClass) => `<div class="skeleton-line ${lineClass}" aria-hidden="true"></div>`)
      .join('');

    return `<article class="${cardClass} skeleton-card">${lines}</article>`;
  }).join('');
}

function renderStateCard({ tone = 'empty', eyebrow = 'Heads up', title, body, tips = [] }) {
  return `
    <article class="state-card state-${tone}">
      <div class="meta-line">${escapeHtml(eyebrow)}</div>
      <h3>${escapeHtml(title)}</h3>
      <p class="support-copy">${escapeHtml(body)}</p>
      ${
        tips.length
          ? `<ul class="bullet-list state-list">${tips
              .map((tip) => `<li>${escapeHtml(tip)}</li>`)
              .join('')}</ul>`
          : ''
      }
    </article>
  `;
}

function setStatusMessage(element, message, tone = 'neutral') {
  element.textContent = message;
  element.className = tone === 'neutral' ? 'status-text' : `status-text status-${tone}`;
}

function setSourceBadge(element, label, tone = 'neutral') {
  element.textContent = label;
  element.className = tone === 'neutral' ? 'pill' : `pill source-${tone}`;
}

function updateSourceBadge(element, source, model) {
  if (source === 'openrouter') {
    setSourceBadge(element, `OpenRouter${model ? ` · ${model}` : ''}`, 'openrouter');
    return;
  }

  setSourceBadge(element, 'Fallback AI', 'fallback');
}

function syncFormDisabledState(form) {
  const isBusy = form.dataset.busy === 'true';
  const isAvailable = form.dataset.available !== 'false';

  for (const control of form.querySelectorAll('input, textarea, button')) {
    control.disabled = isBusy || !isAvailable;
  }

  form.setAttribute('aria-busy', String(isBusy));
}

function setFormAvailability(form, isAvailable) {
  form.dataset.available = isAvailable ? 'true' : 'false';
  syncFormDisabledState(form);
}

function setFormBusy(form, isBusy, busyLabel) {
  form.dataset.busy = isBusy ? 'true' : 'false';

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    if (!submitButton.dataset.idleLabel) {
      submitButton.dataset.idleLabel = submitButton.textContent;
    }

    submitButton.textContent = isBusy ? busyLabel : submitButton.dataset.idleLabel;
    submitButton.classList.toggle('is-busy', isBusy);
  }

  syncFormDisabledState(form);
}

function renderRetryPromptButton() {
  elements.promptList.innerHTML =
    '<button type="button" class="prompt-button prompt-button-primary" data-action="reload">Reload meetup data</button>';

  const reloadButton = elements.promptList.querySelector('[data-action="reload"]');
  if (reloadButton) {
    reloadButton.addEventListener('click', () => window.location.reload());
  }
}

function renderLandingLoading() {
  elements.heroSubtitle.textContent = 'Loading tonight\'s Cambridge-to-Boston builder map...';
  elements.heroMeta.innerHTML = renderPills(['Syncing venue details', 'Loading demos', 'Loading attendee context']);
  elements.communityNote.textContent =
    'Pulling together the agenda, demo tables, and neighborhood context so the room feels useful before you even pick a conversation.';
  elements.heroStats.innerHTML = renderSkeletonCards(3, 'stat-card', ['skeleton-line-short', 'skeleton-line-medium']);
  elements.sessionCount.textContent = 'Loading…';
  elements.attendeeCount.textContent = 'Loading…';
  elements.schedule.innerHTML = renderSkeletonCards(3, 'session-card');
  elements.highlights.innerHTML = renderSkeletonCards(3, 'highlight-card', ['skeleton-line-short', '']);
  elements.attendees.innerHTML = renderSkeletonCards(4, 'attendee-card');
  elements.cityHeadline.textContent = 'Loading Boston context';
  elements.citySummary.textContent = 'Gathering neighborhood notes, meetup norms, and transit-friendly follow-up ideas.';
  elements.cityNeighborhoods.innerHTML = renderPills(['Cambridge', 'Somerville', 'Allston']);
  elements.cityTransit.textContent = 'Transit notes are on the way.';
  elements.norms.innerHTML = renderListItems([], 'Loading meetup norms...');
  elements.collaborationPrompts.innerHTML = renderListItems([], 'Loading conversation starters...');
  elements.promptList.innerHTML = renderSkeletonCards(2, 'state-card', ['skeleton-line-medium', '']);
  setStatusMessage(elements.matchStatus, 'Loading attendee context for the matcher...', 'loading');
  setStatusMessage(elements.ideasStatus, 'Loading themes for build prompts...', 'loading');
  setSourceBadge(elements.matchSource, 'Loading…');
  setSourceBadge(elements.ideasSource, 'Loading…');
  elements.matchResult.innerHTML = renderSkeletonCards(1, 'result-card', ['skeleton-line-short', '', '', '']);
  elements.ideasResult.innerHTML = renderSkeletonCards(2, 'idea-card', ['skeleton-line-short', '', '']);
}

function renderLandingError(message) {
  const guidance = [
    'Make sure the server is running and /api/data is reachable.',
    'Refresh the page after the meetup payload is available again.'
  ];

  elements.heroSubtitle.textContent = 'We could not load tonight\'s meetup snapshot.';
  elements.heroMeta.innerHTML = renderPills(['Meetup feed unavailable']);
  elements.communityNote.textContent =
    'Once the API is back, the page will repopulate with Boston meetup details, live demos, and attendee context.';
  elements.heroStats.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Feed issue',
    title: 'The landing page is waiting on meetup data',
    body: message,
    tips: guidance
  });
  elements.sessionCount.textContent = 'Unavailable';
  elements.attendeeCount.textContent = 'Unavailable';
  elements.schedule.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Agenda paused',
    title: 'Tonight\'s flow is temporarily unavailable',
    body: 'The schedule will appear here as soon as the meetup data endpoint responds again.',
    tips: guidance
  });
  elements.highlights.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Highlights paused',
    title: 'Demo highlights are waiting on the feed',
    body: 'Reload once the data service is healthy to see what is worth orbiting first.',
    tips: guidance
  });
  elements.attendees.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Roster paused',
    title: 'Builder profiles are temporarily unavailable',
    body: 'The attendee context powers the AI matcher, so it needs the seeded roster to load first.',
    tips: guidance
  });
  elements.cityHeadline.textContent = 'Boston context unavailable';
  elements.citySummary.textContent =
    'Neighborhood notes, meetup norms, and transit guidance will return when the data feed is back.';
  elements.cityNeighborhoods.innerHTML = '';
  elements.cityTransit.textContent = 'Retry after the meetup data endpoint is restored.';
  elements.norms.innerHTML = renderListItems([], 'The meetup norms will repopulate once the data feed returns.');
  elements.collaborationPrompts.innerHTML = renderListItems(
    [],
    'Conversation starters will return once the live meetup snapshot is available.'
  );
  renderRetryPromptButton();
  setStatusMessage(elements.matchStatus, 'Meetup data is unavailable, so the matcher is paused.', 'error');
  setStatusMessage(elements.ideasStatus, 'Idea generation is paused until meetup data loads.', 'error');
  setSourceBadge(elements.matchSource, 'Unavailable', 'error');
  setSourceBadge(elements.ideasSource, 'Unavailable', 'error');
  elements.matchResult.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Matcher paused',
    title: 'Start the API and reload',
    body: 'The matcher needs the meetup roster and session list before it can suggest a useful path.',
    tips: guidance
  });
  elements.ideasResult.innerHTML = renderStateCard({
    tone: 'error',
    eyebrow: 'Idea generator paused',
    title: 'Bring back the meetup feed first',
    body: 'Build prompts use the same seeded meetup context, so they will resume once the data endpoint does.',
    tips: guidance
  });
}

function renderHero(data) {
  const stats = Array.isArray(data.stats) ? data.stats : [];

  elements.heroTitle.textContent = data.hero.title;
  elements.heroSubtitle.textContent = data.hero.subtitle;
  elements.heroMeta.innerHTML = renderPills([
    data.hero.venue,
    data.hero.neighborhood,
    data.hero.dateLabel
  ]);
  elements.communityNote.textContent = data.hero.communityNote;
  elements.heroStats.innerHTML = stats.length
    ? stats
        .map(
          (stat) => `
            <article class="stat-card">
              <strong>${escapeHtml(stat.value)}</strong>
              <span>${escapeHtml(stat.label)}</span>
            </article>
          `
        )
        .join('')
    : renderStateCard({
        eyebrow: 'Meetup snapshot',
        title: 'Attendance and demo stats are still warming up',
        body: 'This space fills in once the meetup payload includes count-style details.'
      });
}

function renderSchedule(data) {
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];

  elements.sessionCount.textContent = sessions.length ? `${sessions.length} sessions` : 'Schedule pending';
  elements.schedule.innerHTML = sessions.length
    ? sessions
        .map(
          (session) => `
            <article class="session-card">
              <div class="session-top">
                <div>
                  <div class="meta-line">${escapeHtml(session.time)} · ${escapeHtml(session.tag)}</div>
                  <h3>${escapeHtml(session.title)}</h3>
                </div>
                <span class="meta-pill">${escapeHtml(session.location)}</span>
              </div>
              <p class="session-copy">${escapeHtml(session.description)}</p>
              <p class="session-footer"><strong>Speaker:</strong> ${escapeHtml(session.speaker)}<br /><strong>Why it matters:</strong> ${escapeHtml(session.demoDetails)}</p>
            </article>
          `
        )
        .join('')
    : renderStateCard({
        eyebrow: 'No agenda yet',
        title: 'Tonight\'s flow has not been posted',
        body: 'Check back once the meetup host publishes session timing and room assignments.',
        tips: ['Use the AI cards on the right once the agenda is loaded.', 'Refresh after the event data updates.']
      });
}

function renderHighlights(data) {
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];

  elements.highlights.innerHTML = highlights.length
    ? highlights
        .map(
          (highlight) => `
            <article class="highlight-card">
              <h3>${escapeHtml(highlight.title)}</h3>
              <p class="support-copy">${escapeHtml(highlight.description)}</p>
            </article>
          `
        )
        .join('')
    : renderStateCard({
        eyebrow: 'Highlights pending',
        title: 'Nothing featured yet',
        body: 'This panel fills with quick signals about the demos and room energy once meetup details are loaded.'
      });
}

function renderAttendees(data) {
  const attendees = Array.isArray(data.attendees) ? data.attendees : [];

  elements.attendeeCount.textContent = attendees.length ? `${attendees.length} attendees` : 'Roster pending';
  elements.attendees.innerHTML = attendees.length
    ? attendees
        .map(
          (attendee) => `
            <article class="attendee-card">
              <div class="attendee-top">
                <div>
                  <div class="meta-line">${escapeHtml(attendee.role)}</div>
                  <h3>${escapeHtml(attendee.name)}</h3>
                </div>
                <span class="meta-pill">${escapeHtml(attendee.neighborhood)}</span>
              </div>
              <p class="profile-meta"><strong>Focus:</strong> ${escapeHtml(attendee.focus)}</p>
              <p class="profile-meta"><strong>Project:</strong> ${escapeHtml(attendee.project)}</p>
              <p class="profile-meta"><strong>Looking for:</strong> ${escapeHtml(attendee.lookingFor)}</p>
              <p class="attendee-footer">${escapeHtml(attendee.vibe)} ${escapeHtml(attendee.context)}</p>
            </article>
          `
        )
        .join('')
    : renderStateCard({
        eyebrow: 'Builder roster pending',
        title: 'No attendee profiles yet',
        body: 'Once the meetup roster is loaded, this section will show who is in the room and what they are hoping to build.',
        tips: ['Refresh if the meetup data just changed.', 'The AI matcher becomes more useful once these profiles appear.']
      });
}

function renderCityContext(data) {
  const cityContext = data.cityContext || {};

  elements.cityHeadline.textContent = cityContext.headline || 'Built in Boston';
  elements.citySummary.textContent =
    cityContext.summary ||
    'Local neighborhood context appears here to make the meetup feel more like a builder utility than a generic event page.';
  elements.cityNeighborhoods.innerHTML = renderPills(
    Array.isArray(cityContext.neighborhoods) && cityContext.neighborhoods.length
      ? cityContext.neighborhoods
      : ['Cambridge', 'Somerville', 'Boston']
  );
  elements.cityTransit.textContent =
    cityContext.transitNote || 'Follow-up plans usually happen one train ride away.';
  elements.norms.innerHTML = renderListItems(
    Array.isArray(data.norms) ? data.norms : [],
    'Meetup norms will appear once the event notes are loaded.'
  );
  elements.collaborationPrompts.innerHTML = renderListItems(
    Array.isArray(data.collaborationPrompts) ? data.collaborationPrompts : [],
    'Conversation starters will appear here once the meetup context is available.'
  );
}

function renderPromptList(data) {
  const prompts = [
    data.defaults && data.defaults.matchGoal,
    'Find me the best post-meetup collaborators for a quick build sprint',
    'I want to meet people working on reliable AI systems for actual users'
  ].filter(Boolean);

  if (!prompts.length) {
    elements.promptList.innerHTML = renderStateCard({
      eyebrow: 'Prompt shortcuts unavailable',
      title: 'No suggested asks yet',
      body: 'Shortcut prompts appear here when the meetup defaults are available.'
    });
    return;
  }

  elements.promptList.innerHTML = prompts
    .map(
      (prompt) =>
        `<button type="button" class="prompt-button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`
    )
    .join('');

  for (const button of elements.promptList.querySelectorAll('[data-prompt]')) {
    button.addEventListener('click', () => {
      elements.goalInput.value = button.dataset.prompt || elements.goalInput.value;
      elements.goalInput.focus();
    });
  }
}

function renderDefaultAiStates() {
  elements.matchResult.innerHTML = renderStateCard({
    eyebrow: 'Start here',
    title: 'Ask for a path through the room',
    body: 'The matcher works best when you name the collaborator, session, or workflow you want to optimize for tonight.',
    tips: [
      'Try naming a builder type you want to meet.',
      'Mention a demo category or follow-up sprint goal.'
    ]
  });

  elements.ideasResult.innerHTML = renderStateCard({
    eyebrow: 'Ready for prompts',
    title: 'Generate ideas from the room\'s energy',
    body: 'Give the copilot a concrete meetup theme and it will suggest project directions with implementation angles.',
    tips: ['Ask for productizable demos.', 'Ask for something a small sprint team could start next week.']
  });
}

function findAttendeesByIds(ids = []) {
  if (!state.data || !Array.isArray(state.data.attendees)) {
    return [];
  }

  const lookup = new Map(state.data.attendees.map((attendee) => [attendee.id, attendee]));
  return ids.map((id) => lookup.get(id)).filter(Boolean);
}

function findSessionsByIds(ids = []) {
  if (!state.data || !Array.isArray(state.data.sessions)) {
    return [];
  }

  const lookup = new Map(state.data.sessions.map((session) => [session.id, session]));
  return ids.map((id) => lookup.get(id)).filter(Boolean);
}

function renderMatchResult(result) {
  const attendees = findAttendeesByIds(result.recommendedAttendeeIds);
  const sessions = findSessionsByIds(result.recommendedSessionIds);

  if (!attendees.length && !sessions.length) {
    elements.matchResult.innerHTML = renderStateCard({
      eyebrow: 'No direct match yet',
      title: result.headline || 'Try a sharper goal',
      body:
        result.reason ||
        'Describe the kind of builder, workflow, or session you want and the matcher will take another pass.',
      tips: [
        'Name a builder role, project stage, or workflow pain point.',
        'Mention whether you want demos, collaborators, or fast follow-up intros.'
      ]
    });
    return false;
  }

  elements.matchResult.innerHTML = `
    <article class="result-card">
      <div class="result-top">
        <div>
          <div class="meta-line">Suggested path</div>
          <h3>${escapeHtml(result.headline)}</h3>
        </div>
      </div>
      <p class="result-copy">${escapeHtml(result.reason)}</p>
      <div class="result-tags">
        ${attendees
          .map(
            (attendee) => `
              <div class="highlight-card">
                <div class="meta-line">Meet this builder</div>
                <h3>${escapeHtml(attendee.name)}</h3>
                <p class="support-copy">${escapeHtml(attendee.focus)}</p>
              </div>
            `
          )
          .join('')}
        ${sessions
          .map(
            (session) => `
              <div class="highlight-card">
                <div class="meta-line">Catch this session</div>
                <h3>${escapeHtml(session.title)}</h3>
                <p class="support-copy">${escapeHtml(session.time)} · ${escapeHtml(session.location)}</p>
              </div>
            `
          )
          .join('')}
      </div>
    </article>
  `;

  return true;
}

function renderIdeasResult(result) {
  const ideas = Array.isArray(result.ideas) ? result.ideas : [];

  if (!ideas.length) {
    elements.ideasResult.innerHTML = renderStateCard({
      eyebrow: 'No build prompts yet',
      title: 'Try a more specific theme',
      body: 'A tighter meetup theme usually produces better prompts and more plausible implementation angles.',
      tips: ['Mention a user group, workflow, or demo category.', 'Try narrowing the room to one concrete Boston-style problem.']
    });
    return false;
  }

  elements.ideasResult.innerHTML = ideas
    .map(
      (idea) => `
        <article class="idea-card">
          <div class="meta-line">Build prompt</div>
          <h3>${escapeHtml(idea.title)}</h3>
          <p class="support-copy">${escapeHtml(idea.summary)}</p>
          <p class="profile-meta"><strong>Implementation angle:</strong> ${escapeHtml(idea.implementationAngle)}</p>
          ${
            idea.suggestedStack
              ? `<p class="profile-meta"><strong>Suggested stack:</strong> ${escapeHtml(idea.suggestedStack)}</p>`
              : ''
          }
        </article>
      `
    )
    .join('');

  return true;
}

async function fetchJson(url, options, defaultErrorMessage) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(defaultErrorMessage);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || defaultErrorMessage);
  }

  return payload;
}

async function loadData() {
  state.data = await fetchJson('/api/data', undefined, 'Unable to load meetup data.');
  elements.goalInput.value = (state.data.defaults && state.data.defaults.matchGoal) || '';
  elements.themeInput.value =
    (state.data.defaults && state.data.defaults.ideaTheme) ||
    (Array.isArray(state.data.themes) ? state.data.themes[0] : '') ||
    '';
  renderHero(state.data);
  renderSchedule(state.data);
  renderHighlights(state.data);
  renderAttendees(state.data);
  renderCityContext(state.data);
  renderPromptList(state.data);
  renderDefaultAiStates();
  setStatusMessage(
    elements.matchStatus,
    'Tell the copilot what kind of collaborator, conversation, or session you want to find.'
  );
  setStatusMessage(
    elements.ideasStatus,
    'Generate multiple meetup-relevant ideas with concrete implementation angles.'
  );
  setSourceBadge(elements.matchSource, 'Ready');
  setSourceBadge(elements.ideasSource, 'Ready');
}

async function handleMatchSubmit(event) {
  event.preventDefault();

  if (!state.data) {
    renderLandingError('Meetup data is still unavailable.');
    return;
  }

  const goal = elements.goalInput.value.trim();
  if (!goal) {
    setStatusMessage(
      elements.matchStatus,
      'Add a goal first so the matcher knows which conversation to optimize for.',
      'error'
    );
    setSourceBadge(elements.matchSource, 'Need a goal', 'error');
    elements.matchResult.innerHTML = renderStateCard({
      eyebrow: 'Need more detail',
      title: 'Give the matcher something concrete',
      body: 'Try naming a collaborator type, a workflow bottleneck, or a demo you do not want to miss tonight.',
      tips: [
        'Example: find operators building reliable AI tooling for real users.',
        'Example: help me meet people interested in a fast post-meetup build sprint.'
      ]
    });
    elements.goalInput.focus();
    return;
  }

  setFormBusy(elements.matchForm, true, 'Finding your path...');
  setStatusMessage(elements.matchStatus, 'Scanning the room for the most useful first loop...', 'loading');
  setSourceBadge(elements.matchSource, 'Thinking…');
  elements.matchResult.innerHTML = renderSkeletonCards(1, 'result-card', [
    'skeleton-line-short',
    '',
    '',
    'skeleton-line-medium'
  ]);

  try {
    const payload = await fetchJson(
      '/api/match',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      },
      'Unable to generate a meetup match.'
    );
    const hasSuggestions = renderMatchResult(payload);
    setStatusMessage(
      elements.matchStatus,
      hasSuggestions
        ? 'Here is a strong first loop through tonight.'
        : 'No direct match yet—try naming a builder type, demo, or follow-up goal.',
      hasSuggestions ? 'success' : 'neutral'
    );
    updateSourceBadge(elements.matchSource, payload.source, payload.model);
  } catch (error) {
    setStatusMessage(
      elements.matchStatus,
      'The matcher hit a snag. You can retry or sharpen the ask.',
      'error'
    );
    setSourceBadge(elements.matchSource, 'Try again', 'error');
    elements.matchResult.innerHTML = renderStateCard({
      tone: 'error',
      eyebrow: 'Matcher unavailable',
      title: 'Try again in a moment',
      body: `${error.message} Try again shortly, or rewrite your ask around a builder type, demo, or workflow bottleneck.`,
      tips: [
        'Keep the goal specific and practical.',
        'If the server just restarted, refresh once the data endpoint is healthy again.'
      ]
    });
  } finally {
    setFormBusy(elements.matchForm, false, 'Finding your path...');
  }
}

async function handleIdeasSubmit(event) {
  event.preventDefault();

  if (!state.data) {
    renderLandingError('Meetup data is still unavailable.');
    return;
  }

  const theme = elements.themeInput.value.trim();
  if (!theme) {
    setStatusMessage(
      elements.ideasStatus,
      'Add a theme first so the idea generator knows what kind of sprint to suggest.',
      'error'
    );
    setSourceBadge(elements.ideasSource, 'Need a theme', 'error');
    elements.ideasResult.innerHTML = renderStateCard({
      eyebrow: 'Need a theme',
      title: 'Start with a concrete meetup angle',
      body: 'Try naming a user group, workflow, or demo category so the prompts feel useful and buildable.',
      tips: [
        'Example: local-first tools for Boston communities.',
        'Example: agent workflows for labs, startups, and civic teams.'
      ]
    });
    elements.themeInput.focus();
    return;
  }

  setFormBusy(elements.ideasForm, true, 'Generating prompts...');
  setStatusMessage(elements.ideasStatus, 'Generating Boston-meetup build prompts...', 'loading');
  setSourceBadge(elements.ideasSource, 'Thinking…');
  elements.ideasResult.innerHTML = renderSkeletonCards(2, 'idea-card', [
    'skeleton-line-short',
    '',
    'skeleton-line-medium'
  ]);

  try {
    const payload = await fetchJson(
      '/api/ideas',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      },
      'Unable to generate build ideas.'
    );
    const hasIdeas = renderIdeasResult(payload);
    setStatusMessage(
      elements.ideasStatus,
      hasIdeas
        ? 'Start with one of these and recruit collaborators from the room.'
        : 'No ideas landed yet—try narrowing the theme to one concrete problem.',
      hasIdeas ? 'success' : 'neutral'
    );
    updateSourceBadge(elements.ideasSource, payload.source, payload.model);
  } catch (error) {
    setStatusMessage(
      elements.ideasStatus,
      'Idea generation hit a snag. Retry with a tighter or simpler theme.',
      'error'
    );
    setSourceBadge(elements.ideasSource, 'Try again', 'error');
    elements.ideasResult.innerHTML = renderStateCard({
      tone: 'error',
      eyebrow: 'Idea generator unavailable',
      title: 'Retry with a tighter prompt',
      body: `${error.message} Try again shortly, or narrow the theme to a specific user, workflow, or demo category.`,
      tips: [
        'Ask for a sprint-sized idea instead of a broad category.',
        'Refresh if the server was just restarted.'
      ]
    });
  } finally {
    setFormBusy(elements.ideasForm, false, 'Generating prompts...');
  }
}

async function initialize() {
  setFormAvailability(elements.matchForm, false);
  setFormAvailability(elements.ideasForm, false);
  renderLandingLoading();

  try {
    await loadData();
    setFormAvailability(elements.matchForm, true);
    setFormAvailability(elements.ideasForm, true);
    elements.matchForm.addEventListener('submit', handleMatchSubmit);
    elements.ideasForm.addEventListener('submit', handleIdeasSubmit);
  } catch (error) {
    renderLandingError(error.message);
  }
}

initialize();
