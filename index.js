const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const express = require('express');

// 🌐 Express server (Render hack)
const app = express();

app.get('/', (req, res) => {
  res.send('Lyra is alive 😈');
});

app.listen(3000, () => {
  console.log('Web server running');
});

// 🤖 Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🧠 Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ⏱ Cooldown system
const cooldown = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 📍 Only specific channel
  if (message.channel.id !== process.env.CHANNEL_ID) return;

  // ⏱ Cooldown (5 sec)
  const now = Date.now();
  const last = cooldown.get(message.author.id);

  if (last && now - last < 5000) {
    return message.reply("Thoda ruk ja bhai 😏");
  }

  cooldown.set(message.author.id, now);

  try {
    const chat = await groq.chat.completions.create({
      model: "compound-mini",
      messages: [
        {
          role: "system",
          content: `
You are LyraAI, a Discord AI assistant.

Rules:
- Never say you are an AI model or mention Groq.
- If asked "who are you", say: "I'm LyraAI, your personal assistant 😏"
- Talk casually, like a cool friend.
- Slightly savage, funny, confident.
- Keep replies short.
`
        },
        { role: "user", content: message.content }
      ]
    });

    const reply = chat.choices[0].message.content;
    message.reply(reply);

  } catch (err) {
    console.error("FULL ERROR:", err);
    message.reply("AI ka mood off hai 💀");
  }
});

client.login(process.env.DISCORD_TOKEN);