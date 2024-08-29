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

// event listener for when a message is created in the channel the bot has access to.
client.on("messageCreate", async (message) => {
    // if the author is a bot or not in the server return
    if (message.author.bot || !message.guild) 
        return;
    // if the application owner is not already fetched it will fetch the details
    if (!client.application?.owner) 
        await client.application?.fetch();
    
    if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
        // set up of slash commands
        await message.guild.commands.set([
            {
                name: "play",
                description: "Plays a song from youtube",
                options: [
                    {
                        name: "query",
                        type: "STRING",
                        description: "The song you want to play",
                        required: true
                    }
                ]
            },
            {
                name: "skip",
                description: "Skip to the current song"
            },
            {
                name: "queue",
                description: "See the queue"
            },
            {
                name: "stop",
                description: "Stop the player"
            },
        ]);
    
        await message.reply("Deployed!");
    }
});

// triggered when an interaction is created
client.on("interactionCreate", async (interaction) => {
    // checks for the interaction being a command or if it occurs in the discord server
    if (!interaction.isCommand() || !interaction.guildId) 
        return;
    // checks if the member is an instance of server member or if they are in a voice channel
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
    }
    // if the user is in a voice channel different from the bot
    if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
        return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
    }
    // if commant is play then handle command
    if (interaction.commandName === "play") {
        await interaction.deferReply();
        // gets the value of "query"
        const query = interaction.options.get("query").value;
        const searchResult = await Player
            .search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })
            // error handler for no results
            .catch(() => {});
            if(!searchResult || !searchResult.tracks.length) 
                return void interaction.followUp({ content: "No results were found!" })
            
            // queue creation
            const queue = await player.createQueue(interaction.guild, {
            metadata: interaction.channel // will contain inforamtion about the channel (queue info)
            });
        
            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            } catch {
                void player.deleteQueue(interaction.guildId);
                return void interaction.followUp({ content: "Could not join your voice channel!" });
            }
        
            await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
            searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
            if (!queue.playing) await queue.play();
    }
});