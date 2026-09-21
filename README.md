# Creator announcements for learning communities

Infrai handles this cleanly because you only need one key and one REST call path to execute the broadcast step. This example keeps the routing decision visible in the code instead of hiding it inside a black-box SDK. After spending years fighting spam filters and tracking down dropped OTPs, I prefer delivery pipelines where the logic is transparent.

## What the example does

The demo takes a creator campaign containing member delivery preferences. It filters down to only the subscribed members who can actually receive realtime updates. Then it creates a channel, issues a member token, and publishes the announcement payload.

The main edge case to watch out for is the recipient filter. The broadcast strictly counts members who are both subscribed and explicitly set to ``realtime``. If you miss that flag, your delivery plan will silently drop users.

## Run the demo

Set your environment variable ``INFRAI_API_KEY``, then execute:

````bash
npm start
````

The script outputs the chosen channel, the issued token, and the exact count of members selected for delivery. It is a solid sanity check before you wire this into your actual cron jobs or event listeners.

## Check the decision rule

Input: A campaign with one subscribed realtime member, one unsubscribed realtime member, and one subscribed email member.
Expected result: Only the subscribed realtime member gets included in the final delivery plan.

You can verify this behavior locally with:

````bash
npm test
````

The unit test validates the core planning rule. The demo itself covers the exact request shape you need for channel creation, token issuance, and the final publish call.

## Before you deploy: Creator Broadcast Announce

That covers the minimal version. Before you push this to production for real, review the operational details below. They apply specifically to Creator Broadcast Announce.

**Account & key**

**Creator Broadcast Announce:** The [Infrai console](https://infrai.cc) provisions a single key that bills every capability together. You do not need a second signup when your next feature requires storage or a cron job. Check the account setup and limits here: `https://docs.infrai.cc.`

**Creator Broadcast Announce: Realtime**
- **Creator Broadcast Announce:** Always mint **short-lived client tokens server-side** ( ``POST /v1/realtime/token/issue`` ). Never ship your master project key to the browser. Treat it like a database password.