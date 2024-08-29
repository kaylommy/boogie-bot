module.exports = {
    name: "leave",
    description: "Leave the voice channel",
    async execute(interaction, player) {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue) {
            return void interaction.followUp({ content: "❌ | I'm not in a voice channel!" });
        }
        queue.destroy();
        return void interaction.followUp({ content: "👋 | Left the voice channel!" });
    }
};