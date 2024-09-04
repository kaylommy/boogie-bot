const { QueryType } = require("discord-player");


module.exports = {
    name: "play",
    description: "Plays a song from YouTube",
    options: [
        {
            name: "query",
            type: 3, // STRING
            description: "The song you want to play",
            required: true
        }
    ],
    async execute(interaction, player) {
        await interaction.deferReply(); // Defer the reply since this might take some time
        const query = interaction.options.getString("query");
        console.log(query)
        // console.log(interaction.options.data);
        // console.log(typeof query)
        // console.log(query)
        await playSong(interaction, player, query);
    },
    async executeMessage(message, player) {
        const query = message.content.split(' ').slice(1).join(' ');
        console.log(query)  
        await playSong(message, player, query);
    }
};

async function playSong(context, player, query) {
    // console.log(typeof query)
    // console.log("playSong function called");
    console.log(query)

    // Determine the voice channel to use
    const voiceChannel = context.member ? context.member.voice.channel : context.user.voice.channel;

    if (!voiceChannel) {
        console.log("No voice channel found");
        if (!context.replied && !context.deferred) {
            await context.reply({ content: "You need to join a voice channel first!" });
        }
        return;
    }

    // Search for the track
    let searchResult;
    try {
        // console.log("Searching for track:", query);
        searchResult = await player.search(query, {
            requestedBy: context.user || context.author,
            searchEngine: QueryType.YOUTUBE
        });
        // console.log(typeof query)
        // console.log("Search result:", searchResult);
    } catch (error) {
        console.error("Search error:", error);
        if (!context.replied && !context.deferred) {
            await context.reply({ content: "An error occurred while searching for the song.", ephemeral: true });
        }
        return;
    }

    if (!searchResult || !searchResult.tracks.length) {
        console.log("No tracks found");
        if (!context.replied && !context.deferred) {
            await context.reply({ content: "No results were found!" });
        }
        return;
    }

    const track = searchResult.tracks[0];
    console.log("Playing track:", track);

    try {
        // Play the track
        console.log("Attempting to play track");
        await player.play(voiceChannel, track.title, { 
            metadata: context,
            volume: 100,
        });
    
        console.log(`Now playing: ${track.title}`);
        if (!context.replied && !context.deferred) {
            await context.reply({ content: `Now playing: ${track.title}` });
        }
    } catch (error) {
        console.error("Failed to play track:", error);
        if (!context.replied && !context.deferred) {
            await context.reply({ content: `⚠ | Could not play the track: ${error.message}` });
        }
    }
}