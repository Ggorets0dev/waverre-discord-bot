const path = require('path');
const package = require(path.join(__dirname, '..', 'package.json'));

module.exports = {
    name: 'aboutw',
    description: 'Specifications and settings',
    async execute(message, req, args, config, exfunc, Discord){
        
        let settings_value = `Максимальная длительность видеозаписей, доступных для конвертирования: **${config.max_create_duration} мин**\n\n` +
        `Максимальная длительность видеозаписей, доступных для проигрывания в голосовых каналах: **${config.max_toplay_duration} мин**\n\n` +
        `Максимальное количество файлов WAV, хранящихся на облаке одновременно: **${config.max_wavfiles_uploaded} шт**`
        
        let specifications_value = `Версия: **${package.version}**\n\n` +
        'Платформа: **NodeJS**\n\n' +
        `Библиотека кодирования аудио: **Tweetnacl** *(https://www.npmjs.com/package/tweetnacl)*\n\n` +
        'Инструмент воспроизведения аудио: **FFmpeg-static** *(https://www.npmjs.com/package/ffmpeg-static)*\n\n' +
        'Формат видео с Youtube: **Webm (audio-codec: Opus)**';


        let techw_embed = new Discord.MessageEmbed()
        .setColor(config.embed_color_hex)
        .setTitle(':gear:  Настройки и Характеристики')
        .addFields(
            { name: ':tools: Настройки', value: settings_value },
            { name: ':page_facing_up: Характеристики', value: specifications_value },
        )
        .setFooter( { text: 'ℹ️ Настройки являются константными и не подлежат изменению пользователем'} );
        message.channel.send({embeds: [techw_embed]});
    }
}