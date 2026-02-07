# Nightfly

Nightfly is a Next.js app for club bookings with OTP login, club slot booking, order tracking, and an admin panel.

## Features
- OTP-based login flow for Indian mobile numbers.
- Personal details capture (name, gender, location).
- Club list with search, booking modal, and cart checkout.
- Payment link creation and UTR verification with polling.
- Orders and profile screens.
- Admin panel to update order status and assign managers.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in values:
   ```bash
   cp .env.example .env.local
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string.
- `OTP_API_KEY`: API key for the OTP SMS endpoint.
- `PAYMENT_AUTH_TOKEN`: Bearer token for the payment endpoints.

## Notes
- Orders are saved to MongoDB when `MONGODB_URI` is configured; otherwise they are stored in memory for demo use.
- Use the `/admin` route to manage orders and assign managers.
