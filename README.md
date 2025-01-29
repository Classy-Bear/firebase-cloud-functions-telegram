# Firebase Telegraf Telegram Bot

A Node.js project utilizing Firebase Functions and the Telegraf library to create a Telegram bot. This bot can send notifications to users and echo back any messages they send.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Set Up Firebase](#4-set-up-firebase)
  - [5. Build and Deploy Functions](#5-build-and-deploy-functions)
- [Usage](#usage)
  - [1. Setting Up the Telegram Webhook](#1-setting-up-the-telegram-webhook)
  - [2. Sending Notifications](#2-sending-notifications)
  - [3. Receiving and Echoing Messages](#3-receiving-and-echoing-messages)
- [Testing the Webhook](#testing-the-webhook)
  - [Using Firebase HTTPS Endpoint](#using-firebase-https-endpoint)
  - [Using Tunneling Services (ngrok)](#using-tunneling-services-ngrok)
- [Ignoring TypeScript Errors](#ignoring-typescript-errors)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Features

- **sendNotification**: Sends a "You received a notification" message to a specified Telegram user.
- **onReceivedMessage**: Listens for incoming messages from users and echoes back the same message.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: Version 16 or higher. [Download Node.js](https://nodejs.org/)
- **Firebase CLI**: For deploying functions. Install via npm:
  ```bash
  npm install -g firebase-tools
  ```
- **ngrok** (optional): For local testing of webhooks. [Download ngrok](https://ngrok.com/download)

## Project Structure

```
firebase-telegraf-bot/
├── functions/
│ ├── src/
│ │ └── index.ts
│ ├── package.json
│ ├── tsconfig.json
│ └── .env
├── .firebaserc
├── firebase.json
└── README.md
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/firebase-telegraf-bot.git
cd firebase-telegraf-bot
```

### 2. Install Dependencies

Navigate to the `functions` directory and install the required packages:

```bash
cd functions
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `functions` directory with the following content:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

**Important:** Ensure that `.env` is added to your `.gitignore` to prevent sensitive information from being committed.

### 4. Set Up Firebase

1. **Login to Firebase:**

   ```bash
   firebase login
   ```

2. **Initialize Firebase in Your Project Directory:**

   ```bash
   firebase init
   ```

   - Select **Functions** when prompted.
   - Choose **TypeScript** as the language.
   - Opt to install dependencies when prompted.
   - Configure other settings as per your project needs.

### 5. Build and Deploy Functions

**Build the Project:**

```bash
npm run build
```

**Deploy the Functions:**

```bash
firebase deploy --only functions
```

After deployment, Firebase CLI will provide URLs for your deployed functions.

## Usage

### 1. Setting Up the Telegram Webhook

To enable Telegram to communicate with your Firebase Functions, set up a webhook.

**Steps:**

1. **Obtain Your Firebase Functions HTTPS URL:**

   After deployment, you'll receive URLs like:

   ```
   Function URL (sendNotification): https://us-central1-your-project.cloudfunctions.net/sendNotification
   Function URL (onReceivedMessage): https://us-central1-your-project.cloudfunctions.net/onReceivedMessage
   ```

2. **Set the Webhook URL with Telegram:**

   Replace `<YOUR_TELEGRAM_BOT_TOKEN>` and `<YOUR_CLOUD_FUNCTION_URL>` with your actual values.

   ```bash
   https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=<YOUR_CLOUD_FUNCTION_URL>/onReceivedMessage
   ```

   **Example:**

   ```bash
   https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://us-central1-your-project.cloudfunctions.net/onReceivedMessage
   ```

3. **Verify Webhook Setup:**

   You can verify the webhook status using:

   ```bash
   https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo
   ```

### 2. Sending Notifications

To send a notification to a user, make an HTTP GET request to the `sendNotification` function with the `chatId` as a query parameter.

**Example Request:**

```bash
curl https://us-central1-your-project.cloudfunctions.net/sendNotification?chatId=<USER_CHAT_ID>
```

**Parameters:**

- `chatId`: The unique identifier for the target chat or username of the target channel.

**Example using curl:**

```bash
curl "https://us-central1-your-project.cloudfunctions.net/sendNotification?chatId=123456789"
```


### 3. Receiving and Echoing Messages

When a user sends a message to your Telegram bot, the `onReceivedMessage` function is triggered. The bot responds by echoing back the received message.

**Flow:**

1. **User Sends Message:** A user sends a message to your Telegram bot.
2. **Webhook Triggered:** Telegram sends the message data to the `onReceivedMessage` HTTPS endpoint.
3. **Bot Responds:** The bot processes the message and replies with the same content.

## Testing the Webhook

Testing your webhook is crucial to ensure that your bot interacts correctly with users. You can test the webhook using HTTPS in two primary ways:

### Using Firebase HTTPS Endpoint

After deploying your functions to Firebase, use the provided HTTPS URLs to set up and test the webhook.

**Steps:**

1. **Deploy Functions:**

   ```bash
   firebase deploy --only functions
   ```

2. **Set Webhook URL with Telegram:**

   ```bash
   https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://us-central1-your-project.cloudfunctions.net/onReceivedMessage
   ```

3. **Interact with Your Bot:**

   Send messages to your Telegram bot and observe the responses.

### Using Tunneling Services (ngrok)

During development, you might prefer testing locally without deploying to Firebase every time. **ngrok** allows you to expose your local server to the internet securely via HTTPS.

**Steps:**

1. **Install ngrok:**

   Download and install ngrok from [https://ngrok.com/download](https://ngrok.com/download).

2. **Start Firebase Emulator:**

   In your project directory, run:

   ```bash
   firebase emulators:start
   ```

   By default, Firebase Functions emulator runs on `localhost:5001`.

3. **Expose Local Server with ngrok:**

   ```bash
   ngrok http 5001
   ```

   ngrok will provide a public HTTPS URL forwarding to your local server, e.g., `https://abcd1234.ngrok.io`.

4. **Set Webhook with ngrok URL:**

   ```bash
   https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://abcd1234.ngrok.io/onReceivedMessage
   ```

5. **Test Your Bot:**

   Interact with your Telegram bot and observe the logs in your local development environment.

## Security Considerations

- **HTTPS Only:** Always use HTTPS for webhooks to ensure encrypted data transmission.
- **Secret Tokens:** Store sensitive information like `TELEGRAM_BOT_TOKEN` securely using environment variables.
- **Validate Requests:** Implement checks to verify that incoming requests originate from Telegram.
- **Limit Exposure:** Restrict access to your Firebase Functions to only necessary endpoints.

## Troubleshooting

### Common Issues and Solutions

1. **Webhook Not Receiving Requests:**
   - **Check Deployment:** Ensure that your Firebase Functions are deployed correctly.
   - **Verify ngrok:** If using ngrok, confirm that the tunnel is active and the URL is correctly set.
   - **Firewall Settings:** Ensure that your local firewall or network settings aren't blocking incoming requests.

3. **Bot Not Responding:**
   - **Check Logs:** Use Firebase Console or `firebase emulators:start` logs to identify issues.
   - **Verify Webhook:** Ensure the webhook URL is correctly set and accessible.

3. **Sending Notifications Fails:**
   - **Validate `chatId`:** Ensure that the `chatId` provided is correct.
   - **Bot Permissions:** Confirm that your bot has the necessary permissions to send messages to the user.

### Debugging Tips

- **Enable Detailed Logging:** Add console logs in your functions to trace execution.
- **Use Postman:** Manually send requests to your functions to test responses.
- **Check Telegram Bot Status:** Use Telegram's `getWebhookInfo` to verify webhook status.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

## Acknowledgments

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Telegraf.js](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [ngrok](https://ngrok.com/)

## Contact

For any questions, issues, or contributions, please open an issue.