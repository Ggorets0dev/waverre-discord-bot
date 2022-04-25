const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const yadisk = require('yandex-disk').YandexDisk;
const ytdl = require('ytdl-core');


module.exports = {
    name: 'makew',
    description: 'making wav file from youtube video',
    async execute(message, cmd, args, config, exfunc, Discord){
        
        // * Checking arguments
        if (args.length != 2)                   return message.channel.send(`<@${message.author.id}>\n :anger: **Передано неверное количество аргументов!**`);
        else if (args[0] == "normal")           args[0] = "pcm_s16le";
        else if (args[0] == "best")             args[0] = "pcm_f32le";
        else                                    return message.channel.send(`<@${message.author.id}>\n :anger: **Передан некорректный аргумент качества!**`);

        let quality = args[0]; 
        let url = args[1];

        let validation = await exfunc.GetDownloadItag(url);
        if (!validation) return message.channel.send(`<@${message.author.id}>\n :anger: **Ссылка либо является некорректной, либо ведет к видеозаписи, не имеющей требуемого формата скачивания**`);
        
        let [vid_info, download_itag] = [validation.vid_info, validation.itag];

        if (Number(vid_info.videoDetails.lengthSeconds) / 60 > config.max_create_duration_minutes) return message.channel.send(`<@${message.author.id}>\n :anger: **Слишком большая длительность видео, поддерживаются только видеоролики до ${config.max_create_duration_minutes} минут(ы)!**`);
        
        
        // * Creating WAV
        message.channel.send(`<@${message.author.id}>\n :information_source: **Запрос принят в обработку...**`);

        var track_title = exfunc.FilterTrackTitle(vid_info.videoDetails.title);
        let req_id = Math.floor(Math.random() * config.min_file_inx_range);
        let filename = `${req_id}.webm`;
        
        let home_file_path = path.join(__dirname, '..', filename);
        let workshop_file_path = path.join(__dirname, '..', config.sandbox_dirname, filename);
        let result_path = path.join(__dirname, '..', config.sandbox_dirname, `${req_id}.wav`);
        let ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `${track_title}.wav`);

        let req = ytdl(url, { format: download_itag }).pipe(fs.createWriteStream(filename));

        req.on('finish', () => {
            fs.copyFileSync(home_file_path, workshop_file_path, fs.constants.COPYFILE_EXCL);
            fs.unlinkSync(home_file_path);

            let ffmpeg = spawn('ffmpeg', ['-i', workshop_file_path, '-c:a', quality, result_path]);
            ffmpeg.on('exit', (code, signal) => {
                fs.unlinkSync(workshop_file_path);
                if (code != 0){
                    if (fs.existsSync(result_path)) fs.unlinkSync(result_path);
                    
                    exfunc.Logger('error', 'An error occurred during conversion using ffmpeg', path.basename(__filename));
                    return message.channel.send(`<@${message.author.id}>\n :anger: **Произошла ошибка во время конвертирования!**`);
                }

                var filename_result;
                try{
                    fs.renameSync(result_path, ready_upload_path);
                    if (exfunc.isLibWorthy(track_title)){
                        fs.copyFileSync(ready_upload_path, config.wavlib_path + `${track_title}.wav`);
                        message.channel.send(`<@${message.author.id}>\n ℹ️ **Данный трек был добавлен в аудиотеку WAV**`);
                        exfunc.Logger("info", `New audio (${track_title}) has been added to the WAV audio library`, path.basename(__filename));
                    }
                    filename_result = `${track_title}.wav`;
                }
                catch(error){
                    exfunc.Logger('warning', `Error when working with filenames (${track_title}), switching to template mode`, path.basename(__filename));
                    if (exfunc.isASCII(vid_info.videoDetails.ownerChannelName)) ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `WaverRE_${vid_info.videoDetails.ownerChannelName}_${req_id}_${message.author.username}.wav`)
                    else                                                        ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `WaverRE_NOTASCII_${req_id}_${message.author.username}.wav`)
                    fs.renameSync(result_path, ready_upload_path);
                    filename_result = ready_upload_path.substring(path.join(__dirname, '..', config.sandbox_dirname).length, ready_upload_path.length);
                    message.channel.send(`<@${message.author.id}>\n :warning: **Имя файла было заменено на шаблонное из-за недопустимых символов**`);
                }


                // * Yadisk job
                exfunc.CheckYaSpace();

                var disk = new yadisk(process.env.YADISK_TOKEN);
                disk.uploadFile(ready_upload_path, config.yadisk_wav_path + filename_result, err => {
                    if (err) {
                        exfunc.Logger('error', `An error occurred while uploading a wav file (${track_title}) from the audio library to the cloud`, path.basename(__filename));
                        return message.channel.send(`<@${message.author.id}>\n :anger: **Произошла ошибка во время загрузки файла на облако, либо замените видео, либо повторите запрос позже**`);
                    }
                    else {
                        disk.publish(config.yadisk_wav_path + filename_result, (err, down_link) => {
                            if (err) return exfunc.Logger('error', `An error occurred while publishing a previously uploaded wav file (${track_title}) to the cloud`, path.basename(__filename));
                            else {
                                fs.unlinkSync(ready_upload_path);
                                
                                let wavmake_embed = new Discord.MessageEmbed()
                                .setColor(config.embed_color_hex)
                                .setTitle('🤟 Создание WAV')
                                .addFields(
                                    { name: '✅ Файл загружен', value: `Файл **${filename_result}** успешно загружен на облако и доступен по ссылке: ${down_link}` }
                                )
                                .setFooter( { text: 'ℹ️ Одновременно на облаке может храниться до 15 WAV файлов. Если ссылка является недействительной, стоит повторить запрос'} );
                                message.channel.send({embeds: [wavmake_embed]});
                                exfunc.Logger("success", `Request to create a wav (${track_title}) for user ${message.author.username}#${message.author.discriminator} was successfully completed`, path.basename(__filename)); 
                            }
                        });
                    }
                });
            });
        });
    }
}