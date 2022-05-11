module.exports = {
    name: 'aboutw',
    description: "Specifications and settings",
    async execute(message, req, args, config, exfunc, locale, Discord) {
        const aboutw_embed = new Discord.MessageEmbed()
        .setColor(config.embed_color_hex)
        .setTitle(locale.about_embed.title)
        .addFields(
            { name: locale.about_embed.settings_name, value: locale.about_embed.settings_value },
            { name: locale.about_embed.specifications_name, value: locale.about_embed.specifications_value },
        )
        .setFooter( { text: locale.about_embed.footer } );
        message.channel.send( { embeds: [aboutw_embed] } );
    }
}