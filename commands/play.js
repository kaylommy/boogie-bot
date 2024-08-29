const { QueryType } = require("discord-player");

module.exports = {
    name: "play",
    description: "Plays a song from youtube",
    options: [
        {
            name: "query",
            type: "STRING",
            description: "The song you want to play",
            required: true
        }
    ],
    async execute(interaction, player) {
        await interaction.deferReply();
         // gets the value of "query"
         const query = interaction.options.get("query").value;
         const searchResult = await player
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
             
    }


