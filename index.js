const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const express = require('express');

// ===== EXPRESS SERVER (Render keep alive) =====
const app = express();

app.get('/', (req, res) => {
  res.send("Lyra is alive 😈");
});

app.listen(3000, () => {
  console.log("Web server running");
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== GROQ SETUP =====
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ===== READY EVENT =====
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===== COOLDOWN SYSTEM =====
const cooldown = new Map();

// ===== MESSAGE EVENT =====
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    // Only specific channel
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    // Cooldown (5 sec)
    const now = Date.now();
    const last = cooldown.get(message.author.id);

    if (last && now - last < 5000) {
      return message.reply("Thoda ruk ja bhai 😏");
    }

    cooldown.set(message.author.id, now);

    // ===== AI RESPONSE =====
    const chat = await groq.chat.completions.create({
      model: "compound-mini",
      messages: [
        {
          role: "system",
          content: "You are LyraAI, a smart, chill, slightly savage Discord assistant. Keep replies short, funny, confident."
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const reply = chat.choices[0].message.content;

    message.reply(reply);

  } catch (err) {
    console.error("ERROR:", err);
    message.reply("AI ka mood off hai 💀");
  }
});

// ===== LOGIN =====
console.log("Trying to login...");

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("LOGIN SUCCESS 😈"))
  .catch(err => console.error("LOGIN FAILED 💀", err));