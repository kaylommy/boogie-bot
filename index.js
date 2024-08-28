const { Client, GuildMember, GatewayIntentBits } = require("discord.js");
const { Player, QueryType } = require("discord-player");
const config = require("./config/config.json");

const player = new Player(client);

const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

// logs bot into discord with the bot token as an argument
client.login(config.token); 

client.once('ready', () => {
    console.log('Ready!');
   });
   
   // error handlers for on. On is called every time the event is emitted
   client.on("error", console.error);
   client.on("warn", console.warn);

   player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});
player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

// listener for starting a song
player.on("trackStart", (queue, track) => {
    queue.metadata.send(`▶︎ •၊၊||၊|။|||| | | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

// listener for adding a song
player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`▶︎ •၊၊||၊|။|||| | | Track **${track.title}** queued!`);
});

// listener for bot disconnecting
player.on("botDisconnect", (queue) => {
    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
});

// listener for when no one is in the voice channel
player.on("channelEmpty", (queue) => {
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
});

// listener for when the queue is done
player.on("queueEnd", (queue) => {
    queue.metadata.send("✅ | Queue finished!");
});