const { QueryType } = require("discord-player");

module.exports = {
    name: "play",
    description: "Plays a song from YouTube",
    options: [
        {
            name: "query",
            type: 3,
            description: "The song you want to play",
            required: true
        }
    ],
    async execute(interaction, player) {
        await interaction.deferReply();
        const query = interaction.options.get("query").value;
        await playSong(interaction, player, query);
    },
    async executeMessage(message, player, query) {
        await playSong(message, player, query);
    }
};

async function playSong(context, player, query) {
    const searchResult = await player
        .search(query, {
            requestedBy: context.user || context.author,
            searchEngine: QueryType.YOUTUBE
        })
        .catch(() => {});
    
    if (!searchResult || !searchResult.tracks.length) {
        return void context.reply({ content: "No results were found!" });
    }

    const queue = await player.createQueue(context.guild, {
        metadata: context.channel
    });

    try {
        if (!queue.connection) await queue.connect(context.member.voice.channel);
    } catch {
        void player.deleteQueue(context.guildId);
        return void context.reply({ content: "Could not join your voice channel!" });
    }

    await context.reply({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
    searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
}


