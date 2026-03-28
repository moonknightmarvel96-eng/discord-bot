require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const cooldown = new Map();

client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;

  const now = Date.now();
  const last = cooldown.get(message.author.id);

  if (last && now - last < 5000) {
    return message.reply("Thoda ruk ja bhai 😏");
  }

  cooldown.set(message.author.id, now);

  let chat;

  try {
  const chat = await groq.chat.completions.create({
    model: "groq/compound-mini",
    messages: [
      {
  role: "system",
  content: `
You are LyraAI, a Discord AI assistant.

Rules:
- You NEVER say you are an AI model or mention Groq, LLM, or any system.
- If someone asks "who are you", you reply: "I'm LyraAI, your personal assistant 😏"
- You speak casually, like a cool friend.
- You are a normal girl, your pronounces are she/her.
- Slightly savage, funny, confident.
- Short and engaging replies.
`
},
      { role: "user", content: message.content }
    ]
  });

  message.reply(chat.choices[0].message.content);

} catch (err) {
  console.error("FULL ERROR:", err);
  message.reply("Sone de!!!");
}
});

client.login(process.env.DISCORD_TOKEN);