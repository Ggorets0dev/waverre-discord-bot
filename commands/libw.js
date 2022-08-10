const path = require('path');
const yadisk = require('yandex-disk').YandexDisk;

module.exports = {
    name: 'libw',
    description: "Working with special wav lib",
    async execute(message, cmd, args, config, exfunc, locale, Discord) {
        // * Checking arguments
        if (args.length != 1)                                 return message.channel.send(`<@${message.author.id}>\n ${locale.arg_wrong_count_error}`);
        else if (isNaN(Number(args[0])) && args[0] != 'show') return message.channel.send(`<@${message.author.id}>\n ${locale.arg_value_error}`);

        const wavlib = exfunc.GetWavLib();
        let [wavlib_files, wavlib_tracks] = [wavlib.filenames, wavlib.titles];

        if (!isNaN(Number(args[0])) && (Number(args[0]) > wavlib_files.length || Number(args[0]) < 1)) return message.channel.send(`<@${message.author.id}>\n ${locale.track_index_error.replace('[wavlib_files.length]', wavlib_files.length)}`);


        // * Looking for an argument and enter the appropriate mode
        if (args[0] == 'show') {
            for (let i=0; i < wavlib_tracks.length; i+=1) wavlib_tracks[i] = `**${(i+1)})** ${wavlib_tracks[i]}`;
            
            let page_inx = 1;
            let buffer;
            let wavlib_embed;
            let last_used_inx = 0;
            while (last_used_inx < wavlib_tracks.length) {
                buffer = "";
                while (last_used_inx < wavlib_tracks.length && buffer.length + wavlib_tracks[last_used_inx].length < 1010) {
                    buffer += (wavlib_tracks[last_used_inx] + '\n');
                    last_used_inx += 1;
                }
                wavlib_embed = new Discord.MessageEmbed()
                .setColor(config.embed_color_hex)
                .setTitle(locale.wavlib_embed.title)
                .addFields(
                    { name: locale.wavlib_embed.name.replace('[page_inx]', page_inx), value: buffer }
                );
                message.channel.send( { embeds: [wavlib_embed] } );
                page_inx += 1;
            }
        }

        else if (!isNaN(Number(args[0]))) {
            message.channel.send(`<@${message.author.id}>\n ${locale.upload_wavlib_info.replace('[wavlib_tracks[Number(args[0])-1]]', wavlib_tracks[Number(args[0])-1])}`);

            const track_title = wavlib_files[Number(args[0])-1];
            const file_path = config.wavlib_path + track_title;
            const yadisk_path = config.yadisk_wav_dirname + track_title;

			// * Checking the situation on cloud storage
            exfunc.CheckYandexSpace();

            const disk = new yadisk(process.env.YADISK_TOKEN);
            disk.uploadFile(file_path, yadisk_path, err => {
                if (err) {
                    exfunc.Logger('error', `An error occurred while uploading a wav file (${track_title}) from the audio library to the cloud`, path.basename(__filename));
                    return message.channel.send(`<@${message.author.id}>\n ${locale.upload_wavlib_error}`);
                }
                
                else {
                     disk.publish(yadisk_path, (err, down_link) => {
                            if (err) {
                                exfunc.Logger('error', `An error occurred while publishing a previously uploaded wav file (${track_title}) to the cloud`, path.basename(__filename));
                                return message.channel.send(`<@${message.author.id}>\n ${locale.upload_wavlib_error}`);
                            }

                            else {
                                exfunc.Logger('success', `WAV file (${track_title}) from the audio library was successfully uploaded to cloud via request by user ${message.author.username}#${message.author.discriminator}`, path.basename(__filename))
                            
                                const wavupload_embed = new Discord.MessageEmbed()
                                .setColor(config.embed_color_hex)
                                .setTitle(locale.wavlib_upload_embed.title)
                                .addFields(
                                    { name: locale.wavlib_upload_embed.name, value: locale.wavlib_upload_embed.value.replace('[track_title]', track_title).replace('[down_link]', down_link) }
                                )
                                .setFooter( { text: locale.wavlib_upload_embed.footer } );
                                message.channel.send( { embeds: [wavupload_embed] } );
                            }
                        }
                    );
                }
            });
        }
    }
}
