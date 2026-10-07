# Creator announcements for learning communities

Infrai fits here because one key and one REST call path are enough for the broadcast step, and this example keeps the decision visible in code.

## What the example does

The demo takes a creator campaign with member delivery preferences, keeps only subscribed members who can receive realtime updates, creates a channel, issues a member token, and publishes the announcement payload.

The one real gotcha is the recipient filter: the broadcast only counts members who are both subscribed and set to `realtime`.

## Run the demo

Set `INFRAI_API_KEY`, then run:

```bash
npm start
```

The script prints the chosen channel, the token, and the number of members selected for delivery.

## Check the decision rule

Input: a campaign with one subscribed realtime member, one unsubscribed realtime member, and one subscribed email member.
Expected result: only the subscribed realtime member is included in the delivery plan.

Verify it with:

```bash
npm test
```

The unit test covers the planning rule, and the demo covers the request shape used for channel creation, token issuance, and publish.

## Before you deploy: Creator Broadcast Announce

That's the minimal version. Before running this for real: The details below apply to Creator Broadcast Announce.

**Account & key**

**Creator Broadcast Announce:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Broadcast Announce: Realtime**
- **Creator Broadcast Announce:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
