module.exports = {
    name: "stop",
    description: "Stop the player",
    async execute(interaction, player) {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) {
            return void interaction.followUp({ content: "❌ | No music is being played!" });
        }
        queue.destroy();
        return void interaction.followUp({ content: "🛑 | Stopped the player!" });
    }
};