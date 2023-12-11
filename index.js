const {Client, GatewayIntentBits, Collection, ButtonBuilder, ButtonStyle, Events, ActionRowBuilder, Partials} = require('discord.js');
const path = require("node:path");
const fs = require("node:fs");
const {Player, useMetadata} = require("discord-player");
const {SpotifyExtractor, SoundCloudExtractor, YoutubeExtractor} = require("@discord-player/extractor");
const dotenv = require("dotenv");
const {deployCommands} = require("./deploy");
const {syncDatabase} = require("./database/database");
const {logger} = require("./logs/logger");
const {supplyBookingExecutor} = require("./executors/supplyBookingExecutor");
const {confirmSupplyExecutor} = require("./executors/confirmSupplyExecutor");
const {cancelSupplyExecutor} = require("./executors/cancelSupplyExecutor");
const {changeSupplyTimeExecutor} = require("./executors/changeSupplyTimeExecutor");
const {cancelSupplyModalExecutor} = require("./executors/cancelSupplyModalExecutor");
const {cancelSupplyByMessageExecutor} = require("./executors/cancelSupplyByMessageExecutor");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25
  }
});

client.player.events.on('audioTrackAdd', async (queue, track) => {
  await sendTrackMainMusicMessage(queue, track);
});

client.player.events.on('audioTracksAdd', async (queue, track) => {
  await sendPlaylistMainMusicMessage(queue, track[0].playlist);
});

client.player.events.on('playerStart',  async (queue, track) => {
  const [getMetadata, setMetadata] = useMetadata(queue.metadata.interaction.guild.id);
  let currentMetadata = getMetadata();

  const previous = new ButtonBuilder()
    .setCustomId('previous')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1130799559216472146');

  const pause = new ButtonBuilder()
    .setCustomId('pause')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1131604855585251389');

  const skip = new ButtonBuilder()
    .setCustomId('skip')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1130799560739008572');

  const stop = new ButtonBuilder()
    .setCustomId('stop')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('1130799562957803620');

  const row = new ActionRowBuilder()
    .addComponents(previous, pause, skip, stop);
  let message = await currentMetadata.channel.send({
    components: [row],
    embeds: [nowPlayingEmbed(track.title, track.duration, currentMetadata.interaction.user.id, track.author)]
  });

  currentMetadata.buttonsMessageId = message.id;
  setMetadata(currentMetadata);
});

client.player.events.on('playerFinish', async (queue, track) => {
  let message = await queue.metadata.channel.messages.fetch(queue.metadata.buttonsMessageId);
  if (!!message) {
    await message.delete();
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  let commandName = interaction.isCommand() ? interaction.commandName : interaction.customId;
  const command = interaction.client.commands.get(commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute({client, interaction});
  } catch (error) {
    logger.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
    } else {
      await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  let buttonId = interaction.customId;
  let splitButtonId = buttonId.split('_');
  if (splitButtonId[0] === 'supply') {
    switch (splitButtonId[1]) {
      case 'confirm':
        await confirmSupplyExecutor(splitButtonId[2], interaction, client);
        break;
      case 'cancel':
        await cancelSupplyExecutor(splitButtonId[2], interaction, client);
        break;
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.guildId) return;
  if (message.author.bot) return;
  await supplyBookingExecutor(message, client);
  await changeSupplyTimeExecutor(message, client);
  await cancelSupplyByMessageExecutor(message, client);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId.includes('cancel_supply_modal_')) {
    let supplyId = interaction.customId.split('_')[3];
    await cancelSupplyModalExecutor(supplyId, interaction, client);
  }
});

client.once(Events.ClientReady, async c => {
  await client.player.extractors.loadDefault();
  await client.player.extractors.register(SpotifyExtractor, {});
  await client.player.extractors.register(SoundCloudExtractor, {});
  await client.player.extractors.register(YoutubeExtractor, {});
  let guilds = await client.guilds.fetch();
  guilds.forEach(guild => {
    deployCommands(process.env.TOKEN, process.env.CLIENT_ID, guild.id);
  })
  await syncDatabase();
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);