# AAVE Health Factor Alert

A monitoring service that tracks your AAVE position's health factor and sends emergency push notifications via Pushover when your position is at risk of liquidation.

## Features

- 🔄 Continuous monitoring of AAVE health factor
- 🚨 Emergency push notifications that break through Do Not Disturb (via Pushover)
- 📅 Scheduled daily reports (morning & evening) with health factor and crypto prices
- ⏰ Configurable polling intervals and alert cooldowns
- 🔗 Support for multiple chains (Arbitrum, Ethereum)
- 📊 Detailed account information in alerts
- 💰 Real-time ETH & BTC prices from Chainlink oracles

## Why I built this

I wanted an alert I can always hear—even while asleep. My phone is usually in Do Not Disturb and muted, but Pushover's emergency notifications can break through Do Not Disturb and play a loud sound repeatedly until I acknowledge them. This ensures I will always know when my AAVE health factor drops too low so I can react before liquidation.

## Setup

### Prerequisites

- [Bun](https://bun.sh) installed

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Pushover

1. Create a Pushover account at [pushover.net](https://pushover.net)
2. [Register your application](https://pushover.net/apps/build) to get an API token (`PUSHOVER_APP_TOKEN`)
3. Find your user key in the [Pushover dashboard](https://pushover.net) (`PUSHOVER_USER_KEY`)

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
- `MORNING_HOUR`: Hour to send morning report in 24h format (default: `8`). Range: `0-23`
- `EVENING_HOUR`: Hour to send evening report in 24h format (default: `20`). Range: `0-23`
- `TIMEZONE`: Timezone for scheduled reports (default: `UTC`). Examples: `America/New_York`, `Europe/London`, `Asia/Tokyo`
- `RPC_URL`: Custom RPC endpoint (optional)
- `POOL_ADDRESS`: Custom AAVE pool address (optional)
- `PUSHOVER_NOTIFICATION_SOUND`: Notification sound (default: `echo`)
- `PUSHOVER_RETRY`: Emergency notification retry interval in seconds (default: `60`, min: `30`)
- `PUSHOVER_EXPIRE`: Emergency notification expiration in seconds (default: `3600`, max: `10800`)

## Usage

### Run with Docker (optional)

```bash
docker compose up -d --build
```

The container reads settings from your local `.env`.

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
3. Send scheduled daily reports (non-urgent) at morning and evening times
4. Emergency notifications will retry at the configured interval until acknowledged or expired (Pushover behavior)
5. The service suppresses new emergency alerts until either the expiration window passes or health factor recovers above the threshold (then the cooldown resets)

## Notifications

### Emergency Alerts

When your health factor drops below the threshold, you'll receive an **emergency notification** that:

- Bypasses quiet hours on your devices
- Retries at the configured interval (default: every 60 seconds)
- Continues until acknowledged or expiration (default: 1 hour)
- Includes a direct link to the AAVE app
- Shows detailed position information

Tip: To ensure alerts can break through Do Not Disturb, keep notifications set to emergency in your configuration and verify Pushover is allowed to override DND on your device.

### Scheduled Daily Reports

The service automatically sends **non-urgent notifications** twice daily (configurable times):

- Morning report (default: 8:00 / 8 AM)
- Evening report (default: 20:00 / 8 PM)

Note: Report times use your configured `TIMEZONE`.

Each report includes:

- Current health factor
- ETH price (from Chainlink oracle)
- BTC price (from Chainlink oracle)
- Chain and wallet information

These reports use a non-urgent priority so they won't disturb you, but keep you informed of your position and market conditions.

## Supported Chains

- Arbitrum (default)
- Ethereum
