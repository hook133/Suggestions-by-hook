import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, AttachmentBuilder, ChannelType } from 'discord.js';
import { renderSuggestionCard } from './render.js';

const TOKEN = process.env.DISCORD_TOKEN;
const SUGGESTIONS_CHANNEL_ID = process.env.SUGGESTIONS_CHANNEL_ID;
const BG_URL = process.env.SUGGESTION_BG_URL || '';

if (!TOKEN) {
  console.error('[ERROR] DISCORD_TOKEN is missing in .env');
  process.exit(1);
}
if (!SUGGESTIONS_CHANNEL_ID) {
  console.error('[ERROR] SUGGESTIONS_CHANNEL_ID is missing in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel?.type === ChannelType.DM) return;

    if (message.channelId !== SUGGESTIONS_CHANNEL_ID) return;

    const content = message.content?.trim() || '';
    const suggestion = content;
    if (!suggestion) {
      await message.delete().catch(() => {});
      return;
    }

    const author = message.author;
    const username = author.globalName || author.username;
    const avatarUrl = author.displayAvatarURL({ extension: 'png', size: 256 });

    await message.delete().catch(() => {});

    const pngBuffer = await renderSuggestionCard({
      username,
      avatarUrl,
      suggestion,
      backgroundUrl: BG_URL,
      width: 1000,
      height: 400,
    });

    const attachment = new AttachmentBuilder(pngBuffer, { name: 'suggestion.png' });

    await message.channel.send({ files: [attachment] });
  } catch (err) {
    console.error('Error handling message:', err);
  }
});

client.login(TOKEN);
