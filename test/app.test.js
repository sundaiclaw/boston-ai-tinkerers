const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../public/meetup-data.json');

test('meetup seed data includes 4 sessions', () => {
  assert.equal(data.sessions.length, 4);
});

test('meetup seed data includes attendee focuses', () => {
  assert.ok(data.attendees.some(person => person.focus === 'Local inference'));
});
