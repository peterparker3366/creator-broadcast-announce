import test from 'node:test';
import assert from 'node:assert/strict';
import { planAnnouncement } from './creator_broadcast.js';

test('broadcast plan keeps only subscribed realtime members', () => {
  const plan = planAnnouncement({
    campaign_id: 'camp_7',
    creator_id: 'creator_9',
    title: 'Study guide is ready',
    body: 'The worksheet is available now.',
    members: [
      { member_id: 'a', subscribed: true, delivery_preference: 'realtime' },
      { member_id: 'b', subscribed: false, delivery_preference: 'realtime' },
      { member_id: 'c', subscribed: true, delivery_preference: 'email' }
    ]
  });

  assert.equal(plan.channel, 'creator:creator_9:announcement:camp_7');
  assert.deepEqual(plan.recipients, [{ member_id: 'a', subscribed: true, delivery_preference: 'realtime' }]);
  assert.equal(plan.contentSummary, 'Study guide is ready • 1 realtime member(s)');
});
