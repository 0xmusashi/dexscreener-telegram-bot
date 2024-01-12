require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const formatNumber = (num) => {
    let result = '';
    let fixed = 0.0;
    if (num > 1000000) {
        fixed = (num / 1000000).toFixed(2);
        result = `${fixed} M`;
    } else {
        fixed = (num / 1000).toFixed(2);
        result = `${fixed} K`;
    }
    return result;
}

const msToTime = (ms) => {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " Sec";
    else if (minutes < 60) return minutes + " Min";
    else if (hours < 24) return hours + " Hrs";
    else return days + " Days"
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
        const priceChange = pair.priceChange.h24.toFixed(2);
        const { url, chainId, pairAddress, pairCreatedAt } = pair;
        const age = msToTime(Math.abs(new Date() - pairCreatedAt));

        const message = `
📌 ${name} ($${symbol})

🔸 Chain: ${chainId} | ⚖️ Age: ${age}

💰 <b>FDV</b>: ${fdv} | <b>Liq</b>: ${liquidity}

📈 24h: ${priceChange}%

📊 <a href='${url}'>DexScreener</a>

💲 Price: $${price}

DYOR/NFA: Automated report.
        `;

        const opts = {
            parse_mode: 'HTML',
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
