import { announcementRequestSchema, broadcastAnnouncement } from './creator_broadcast.js';

const sample = announcementRequestSchema.parse({
  campaign_id: 'spring-lesson-01',
  creator_id: 'creator_42',
  title: 'New lesson pack is live',
  body: 'Members now have access to the workbook and replay.',
  members: [
    { member_id: 'm1', subscribed: true, delivery_preference: 'realtime' },
    { member_id: 'm2', subscribed: false, delivery_preference: 'realtime' },
    { member_id: 'm3', subscribed: true, delivery_preference: 'email' }
  ]
});

const result = await broadcastAnnouncement(sample);
console.log(JSON.stringify(result, null, 2));
