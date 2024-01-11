require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const formatNumber = (num) => {
    const result = num / 1000000;
    return `$result M`;
}

bot.onText(/\/price (.+)/, async (msg, match) => {
    const address = match[1];
    try {
        const response = await axios.get(`${process.env.API_ENDPOINT}${address}`);
        const pair = response.data.pairs[0];
        const { symbol, name } = pair.baseToken;
        const price = pair.priceUsd;
        const liquidity = formatNumber(pair.liquidity.usd);
        const fdv = formatNumber(pair.fdv);
        const message = `
${name} Price Info\n
$${symbol} price is ${price} USD\n
FDC is ${fdv} USD\n
Liquidity: ${liquidity} USD
        `;

        const opts = {
            parsed_mode: 'HTML',
        }

        await bot.sendMessage(msg.chat.id, message, opts);
    } catch (error) {
        await bot.sendMessage(msg.chat.id, 'Error fetching price data. Please try again later.');
    }
});

bot.onText(/\/test/, async (msg, match) => {
    try {
        await bot.sendMessage(msg.chat.id, 'test response');
    } catch (error) {
        console.error(error);
        await bot.sendMessage(msg.chat.id, 'Error fetching price data. Please try again later.');
    }
});
