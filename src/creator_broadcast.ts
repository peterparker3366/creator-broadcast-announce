import { z } from 'zod';
import { infrai } from './infrai_client.js';

export const announcementRequestSchema = z.object({
  campaign_id: z.string().min(1),
  creator_id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  members: z.array(
    z.object({
      member_id: z.string().min(1),
      subscribed: z.boolean(),
      delivery_preference: z.enum(['realtime', 'email'])
    })
  ).min(1)
});

export type AnnouncementRequest = z.infer<typeof announcementRequestSchema>;

export function planAnnouncement(input: AnnouncementRequest) {
  const recipients = input.members.filter((member) => member.subscribed && member.delivery_preference === 'realtime');
  return {
    channel: `creator:${input.creator_id}:announcement:${input.campaign_id}`,
    recipients,
    digitalAsset: {
      kind: 'announcement',
      title: input.title,
      body: input.body
    },
    contentSummary: `${input.title} • ${recipients.length} realtime member(s)`
  };
}

export async function broadcastAnnouncement(input: AnnouncementRequest) {
  const plan = planAnnouncement(input);

  await infrai.realtime.channel.create({
    channel: plan.channel,
    type: 'group',
    vendor: 'creator-commerce'
  });

  const token = await infrai.realtime.token.issue({
    client_id: input.creator_id,
    channels: [plan.channel],
    capabilities: ['publish'],
    ttl_seconds: 1800
  });

  const publishResult = await infrai.realtime.publish({
    channel: plan.channel,
    event: 'creator_announcement_published',
    data: {
      campaign_id: input.campaign_id,
      asset: plan.digitalAsset,
      recipients: plan.recipients.map((member) => ({ member_id: member.member_id }))
    },
    account_id: input.creator_id
  });

  return {
    channel: plan.channel,
    token: token.token,
    delivered_to: plan.recipients.length,
    content_summary: plan.contentSummary,
    published: publishResult.published
  };
}
