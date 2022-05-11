module.exports = {
    name: 'helpw',
    description: "Documentation",
    async execute(message, cmd, args, config, exfunc, locale, Discord) {
        const helpw_embed = new Discord.MessageEmbed()
        .setColor(config.embed_color_hex)
        .setTitle(locale.help_embed.title)
        .addFields(
            { name: locale.help_embed.creating_name, value: locale.help_embed.creating_value },
            { name: locale.help_embed.playing_name_1, value: locale.help_embed.playing_value_1 },
            { name: locale.help_embed.playing_name_2, value: locale.help_embed.playing_value_2 }
        );
        message.channel.send( { embeds: [helpw_embed] } );
    }
}