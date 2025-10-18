# AAVE Health Factor Alert

A monitoring service that tracks your AAVE position's health factor and sends emergency push notifications via Pushover when your position is at risk of liquidation.

## Features

- 🔄 Continuous monitoring of AAVE health factor
- 🚨 Emergency push notifications (Priority 2) via Pushover
- ⏰ Configurable polling intervals and alert cooldowns
- 🔗 Support for multiple chains (Arbitrum, Ethereum)
- 📊 Detailed account information in alerts

## Why I built this

I wanted an alert I can always hear—even while asleep. My phone is usually in Do Not Disturb and muted, but Pushover's emergency (priority 2) notifications can break through DND and play a loud sound repeatedly until I acknowledge them. This ensures I will always know when my AAVE health factor drops too low so I can react before liquidation.

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Pushover

1. Create a Pushover account at [pushover.net](https://pushover.net)
2. [Register your application](https://pushover.net/apps/build) to get an API token (`APP_TOKEN`)
3. Find your user key in the [Pushover dashboard](https://pushover.net) (`USER_KEY`)

### 3. Configure Environment

Copy `.env.template` to `.env` and fill in your configuration:

```bash
cp .env.template .env
```

Required configuration:

- `WALLET`: Your wallet address to monitor
- `PUSHOVER_APP_TOKEN`: Your Pushover application token
- `PUSHOVER_USER_KEY`: Your Pushover user key

Optional configuration:

- `CHAIN`: Network to monitor (default: `arbitrum`)
- `HF_THRESHOLD`: Health factor threshold for alerts (default: `1.3`)
- `POLL_INTERVAL_MS`: How often to check (default: `15000` ms)
- `RPC_URL`: Custom RPC endpoint (optional)
- `POOL_ADDRESS`: Custom AAVE pool address (optional)
- `PUSHOVER_NOTIFICATION_SOUND`: Notification sound (default: `echo`)
- `PUSHOVER_RETRY`: Emergency notification retry interval in seconds (default: `60`, min: `30`)
- `PUSHOVER_EXPIRE`: Emergency notification expiration in seconds (default: `3600`, max: `10800`)

## Usage

Development (watch mode):

```bash
bun run dev
```

Production:

```bash
bun start
```

The service will:

1. Check your AAVE health factor at the configured interval
2. If health factor drops below threshold, send an emergency push notification
3. Emergency notifications (Priority 2) will retry at the configured interval until acknowledged or expired (Pushover behavior)
4. The service suppresses new emergency alerts until either the expiration window passes or health factor recovers above the threshold (then the cooldown resets)

## Emergency Notifications

When your health factor drops below the threshold, you'll receive a **Priority 2 emergency notification** that:

- Bypasses quiet hours on your devices
- Retries at the configured interval (default: every 60 seconds)
- Continues until acknowledged or expiration (default: 1 hour)
- Includes a direct link to the AAVE app
- Shows detailed position information

Tip: To ensure alerts can break through Do Not Disturb, keep notifications at priority 2 (emergency) in your configuration and verify Pushover is allowed to override DND on your device.

## Supported Chains

- Arbitrum (default)
- Ethereum
