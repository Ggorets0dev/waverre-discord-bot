const path = require('path');
const yadisk = require('yandex-disk').YandexDisk;

module.exports = {
    name: 'libw',
    description: 'Working with special wav lib',
    async execute(message, cmd, args, config, exfunc, Discord){
        
        // * Checking arguments
        if (args.length != 1)                                 return message.channel.send(`<@${message.author.id}>\n :anger: **Передано неверное количество аргументов!**`);
        else if (isNaN(Number(args[0])) && args[0] != "show") return message.channel.send(`<@${message.author.id}>\n :anger: **Передан некорректный аргумент!**`);

        var wavlib = exfunc.GetWavLib();
        let wavlib_files = wavlib.filenames;
        let wavlib_tracks = wavlib.titles;

        if (!isNaN(Number(args[0])) && (Number(args[0]) > wavlib_files.length || Number(args[0]) < 1)) return message.channel.send(`<@${message.author.id}>\n :anger: **Введенный индекс трека выпадает из зоны допустимых значений! (1-${wavlib_files.length})**`);


        // * Working with args
        if (args[0] == "show"){
            for (let i=0; i < wavlib_tracks.length; i+=1) wavlib_tracks[i] = `**${(i+1)})** ${wavlib_tracks[i]}`;
            
            let embed_inx = 1;
            let buffer;
            let wavlib_embed;
            let last_used_inx = 0;
            while (last_used_inx < wavlib_tracks.length){
                buffer = "";
                while (last_used_inx < wavlib_tracks.length && buffer.length + wavlib_tracks[last_used_inx].length < 1010){
                    buffer += (wavlib_tracks[last_used_inx] + '\n');
                    last_used_inx += 1;
                }
                wavlib_embed = new Discord.MessageEmbed()
                .setColor(config.embed_color_hex)
                .setTitle('🧾 Аудиотека WAV')
                .addFields(
                    { name: `ℹ️ Список доступных треков (стр ${embed_inx}):`, value: buffer }
                );
                message.channel.send({embeds: [wavlib_embed]});
                embed_inx += 1;
            }
        }

        else if (!isNaN(Number(args[0]))) {
            message.channel.send(`<@${message.author.id}>\n :clock3:   Загружаю на облако запрошенный аудиофайл: **${wavlib_tracks[Number(args[0])-1]}.wav**`);

            let track_title = wavlib_files[Number(args[0])-1];
            let file_path = config.wavlib_path + track_title;
            let yadisk_dst = config.yadisk_wav_dirname + track_title;

            exfunc.CheckYaSpace();

            let disk = new yadisk(process.env.YADISK_TOKEN);
            disk.uploadFile(file_path, yadisk_dst, err => {
                if (err){
                    exfunc.Logger('error', `An error occurred while uploading a wav file (${track_title}) from the audio library to the cloud`, path.basename(__filename));
                    return message.channel.send(`<@${message.author.id}>\n :anger: **Не удалось загрузить аудиофайл по вашему запросу, попробуйте повторить его позже**`);
                }
                else{
                     disk.publish(yadisk_dst, (err, down_link) => {
                            if (err){
                                exfunc.Logger('error', `An error occurred while publishing a previously uploaded wav file (${track_title}) to the cloud`, path.basename(__filename));
                                return message.channel.send(`<@${message.author.id}>\n :anger: **Не удалось загрузить аудиофайл по вашему запросу, попробуйте повторить его позже**`);
                            }
                            exfunc.Logger('success', `WAV file (${track_title}) from the audio library was successfully uploaded to cloud via request by user ${message.author.username}#${message.author.discriminator}`, path.basename(__filename))
                            
                            let wavmake_embed = new Discord.MessageEmbed()
                            .setColor(config.embed_color_hex)
                            .setTitle('🤟 Загрузка WAV')
                            .addFields(
                                { name: '✅ Файл загружен', value: `Файл **${track_title}** успешно загружен на облако и доступен по следующей ссылке: ${down_link}` }
                            )
                            .setFooter( { text: 'ℹ️ Одновременно на облаке может храниться 15 WAV файлов. Если ссылка является недействительной, стоит повторить запрос'} );
                            message.channel.send({embeds: [wavmake_embed]});
                        }
                    );
                }
            });
        }
    }
}
