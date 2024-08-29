const { Client, GuildMember, GatewayIntentBits, Collection } = require("discord.js");
const { Player } = require("discord-player");
const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

const player = new Player(client);
client.commands = new Collection();

// Load commands dynamically
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
    const command = require(`./commands/${folder}`);
    client.commands.set(command.name, command);
}
const token = process.env.TOKEN;
if (!token) {
    console.error("Bot token is not defined in the environment variables.");
    process.exit(1);
}

client.login(token);

client.once('ready', () => {
    console.log('Ready!');
});

client.on("error", console.error);
client.on("warn", console.warn);

player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});
player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.on("trackStart", (queue, track) => {
    queue.metadata.send(`▶︎ •၊၊||၊|။|||| | | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`▶︎ •၊၊||၊|။|||| | | Track **${track.title}** queued!`);
});

player.on("botDisconnect", (queue) => {
    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
});

player.on("channelEmpty", (queue) => {
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
});

player.on("queueEnd", (queue) => {
    queue.metadata.send("✅ | Queue finished!");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
        await message.guild.commands.set(client.commands.map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || []
        })));
        await message.reply("Deployed!");
    }
        // Handle message commands
        const prefix = "!";
        if (!message.content.startsWith(prefix)) return;
    
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
    
        const command = client.commands.get(commandName);
        if (command && command.executeMessage) {
            try {
                await command.executeMessage(message, player, args.join(" "));
            } catch (error) {
                console.error(error);
                await message.reply({ content: "There was an error executing that command!" });
            }
        }
});


client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) return;
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
    }
    if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
        return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
    }

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction, player);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error executing that command!", ephemeral: true });
        }
    }
});