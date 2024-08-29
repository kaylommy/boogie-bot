module.exports = {
    name: "pause",
    description: "Pause the current song",
    async execute(interaction, player) {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) {
            return void interaction.followUp({ content: "❌ | No music is being played!" });
        }
        queue.setPaused(true);
        return void interaction.followUp({ content: "⏸ | Paused the player!" });
    }
};