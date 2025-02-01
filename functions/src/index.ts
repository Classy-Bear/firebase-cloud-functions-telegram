import * as functions from 'firebase-functions';
import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

/**
 * Load environment variables from .env file
 * This allows us to configure the bot without hardcoding sensitive data
 */
dotenv.config();

/**
 * Telegram Bot Configuration
 * The bot token should be stored in your .env file as TELEGRAM_BOT_TOKEN
 * You can obtain a token by talking to @BotFather on Telegram
 */
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in the environment variables.');
}

// Initialize Telegraf bot instance
const bot = new Telegraf(token);

/**
 * HTTP endpoint to send notifications to Telegram users
 * 
 * @function sendNotification
 * @type {functions.https.HttpsFunction;}
 * 
 * @param {functions.Request} req - The HTTP request object
 * @param {string} req.query.chatId - The Telegram chat ID to send the notification to
 * @param {functions.Response} res - The HTTP response object
 * 
 * @example
 * // Send a notification
 * GET /sendNotification?chatId=123456789
 * 
 * @returns {Promise<void>} Resolves when the notification is sent
 * @throws {Error} If the notification fails to send
 */
export const sendNotification = functions.https.onRequest(async (req, res) => {
  const chatId = req.query.chatId as string | undefined;
  
  if (!chatId) {
    res.status(400).send('No chatId provided.');
    return;
  }

  try {
    await bot.telegram.sendMessage(chatId, 'You received a notification');
    res.status(200).send('Notification sent.');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Failed to send notification.');
  }
});

/**
 * HTTP endpoint to handle incoming Telegram messages
 * This function processes webhook updates from Telegram
 * 
 * @function onReceivedMessage
 * @type {functions.https.HttpsFunction;}
 * 
 * @param {functions.Request} req - The HTTP request object containing the Telegram update
 * @param {functions.Response} res - The HTTP response object
 * 
 * @description
 * This endpoint should be set as the webhook URL for your Telegram bot.
 * It currently echoes back any message sent by users.
 * 
 * @example
 * // Telegram sends updates to this endpoint
 * POST /onReceivedMessage
 * body: {
 *   "update_id": 123456789,
 *   "message": {
 *     "message_id": 1,
 *     "from": {...},
 *     "chat": {...},
 *     "text": "Hello bot!"
 *   }
 * }
 * 
 * @returns {Promise<void>} Resolves when the message is handled
 * @throws {Error} If the message handling fails
 */
export const onReceivedMessage: functions.https.HttpsFunction = functions.https.onRequest(async (req, res) => {
  try {
    const chatId = req.query.chatId as string | undefined;
    if (!chatId) {
      res.status(400).send('No chatId provided.');
      return;
    }
    await bot.handleUpdate(req.body, res);
    await bot.telegram.sendMessage(chatId, req.body);
    res.status(200).send('Message handled.');
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).send('Failed to handle message.');
  }
});

/**
 * HTTP endpoint to send files to Telegram users
 * 
 * @function sendFile
 * @type {functions.https.HttpsFunction}
 * 
 * @param {functions.Request} req - The HTTP request object
 * @param {string} req.query.chatId - The Telegram chat ID to send the file to
 * @param {string} req.query.fileUrl - The URL of the file to send
 * @param {functions.Response} res - The HTTP response object
 * 
 * @example
 * // Send a file
 * GET /sendFile?chatId=123456789&fileUrl=https://example.com/file.pdf
 * 
 * @returns {Promise<void>} Resolves when the file is sent
 * @throws {Error} If the file fails to send
 */
export const sendFile = functions.https.onRequest(async (req, res) => {
  const chatId = req.query.chatId as string | undefined;
  const fileUrl = req.query.fileUrl as string | undefined;
  
  if (!chatId) {
    res.status(400).send('No chatId provided.');
    return;
  }

  if (!fileUrl) {
    res.status(400).send('No fileUrl provided.');
    return;
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.body}, ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    await bot.telegram.sendDocument(chatId, { source: Buffer.from(buffer), filename: 'index.js' });
    res.status(200).send('File sent successfully.');
  } catch (error) {
    console.error('Error sending file:', error);
    res.status(500).send('Failed to send file.');
  }
});
