module.exports = {
    name: "resume",
    description: "Resume the current song",
    async execute(interaction, player) {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) {
            return void interaction.followUp({ content: "❌ | No music is being played!" });
        }
        queue.setPaused(false);
        return void interaction.followUp({ content: "▶ | Resumed the player!" });
    }
};