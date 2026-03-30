const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../public/meetup-data.json');

test('meetup seed data includes at least 5 sessions after rebuild', () => {
  assert.ok(data.sessions.length >= 5);
});

test('meetup seed data includes Boston-area attendee neighborhoods', () => {
  assert.ok(data.attendees.some(person => person.neighborhood === 'Cambridge'));
});
