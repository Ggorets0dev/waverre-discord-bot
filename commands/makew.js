const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const yadisk = require('yandex-disk').YandexDisk;
const ytdl = require('ytdl-core');


module.exports = {
    name: 'makew',
    description: "Making wav file from youtube video",
    async execute(message, cmd, args, config, exfunc, locale, Discord) {
        // * Checking arguments
        if (args.length != 2)         return message.channel.send(`<@${message.author.id}>\n ${locale.arg_wrong_count_error}`);
        else if (args[0] == 'normal') args[0] = 'pcm_s16le';
        else if (args[0] == 'best')   args[0] = 'pcm_f32le';
        else                          return message.channel.send(`<@${message.author.id}>\n ${locale.arg_value_error}`);

        const [quality, url] = [args[0], args[1]]; 

        const validation = await exfunc.GetDownloadItag(url);
        if (!validation) return message.channel.send(`<@${message.author.id}>\n ${locale.url_invalid_error}`);
        
        let [vid_info, download_itag] = [validation.vid_info, validation.itag];

        if (Number(vid_info.videoDetails.lengthSeconds) / 60 > config.max_create_duration_minutes) return message.channel.send(`<@${message.author.id}>\n ${locale.long_video_create_error}`);
        
        
        // * Creating WAV
        message.channel.send(`<@${message.author.id}>\n ${locale.query_processing_info}`);

        let track_title = exfunc.FilterTrackTitle(vid_info.videoDetails.title);
        let req_id = Math.floor(Math.random() * config.min_file_inx_range);
        let filename = `${req_id}.webm`;
        
        const home_file_path = path.join(__dirname, '..', filename);
        const workshop_file_path = path.join(__dirname, '..', config.sandbox_dirname, filename);
        const result_path = path.join(__dirname, '..', config.sandbox_dirname, `${req_id}.wav`);
        let ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `${track_title}.wav`);

        const req = ytdl(url, { format: download_itag }).pipe(fs.createWriteStream(filename));
        req.on('finish', err => {
            if (err) {
                exfunc.Logger('error', `Failed to upload video (url: ${url})`, path.basename(__filename));
                return message.channel.send(`<@${message.author.id}>\n ${locale.upload_requested_error}`);
            }

            else {
                fs.copyFileSync(home_file_path, workshop_file_path, fs.constants.COPYFILE_EXCL);
                fs.unlinkSync(home_file_path);
    
                const ffmpeg = spawn('ffmpeg', ['-i', workshop_file_path, '-c:a', quality, result_path]);
                ffmpeg.on('exit', (code, signal) => {
                    fs.unlinkSync(workshop_file_path);
                    
                    if (code != 0) {
                        if (fs.existsSync(result_path)) fs.unlinkSync(result_path);
                        
                        exfunc.Logger('error', 'An error occurred during conversion ${(track_title)}', path.basename(__filename));
                        return message.channel.send(`<@${message.author.id}>\n ${locale.convert_error}`);
                    }
    
                    let filename_result;
                    try {
                        fs.renameSync(result_path, ready_upload_path);
                        if (exfunc.isLibWorthy(track_title)) {
                            fs.copyFileSync(ready_upload_path, config.wavlib_path + `${track_title}.wav`);
                            
                            message.channel.send(`<@${message.author.id}>\n ${locale.wavlib_added_info}`);
                            exfunc.Logger('info', `New audio (${track_title}) has been added to the WAV audio library`, path.basename(__filename));
                        }
                        filename_result = `${track_title}.wav`;
                    }
                    catch(error) {
                        if (exfunc.isASCII(vid_info.videoDetails.ownerChannelName)) ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `WaverRE_${vid_info.videoDetails.ownerChannelName}_${req_id}_${message.author.username}.wav`)
                        else                                                        ready_upload_path = path.join(__dirname, '..', config.sandbox_dirname, `WaverRE_NOTASCII_${req_id}_${message.author.username}.wav`)
                        
                        fs.renameSync(result_path, ready_upload_path);
                        filename_result = ready_upload_path.substring(path.join(__dirname, '..', config.sandbox_dirname).length, ready_upload_path.length);
                        
                        message.channel.send(`<@${message.author.id}>\n ${locale.filename_changed_warning}`);
                        exfunc.Logger('warning', `Error when working with filenames (${track_title}), switching to template mode`, path.basename(__filename));
                    }
    
    
                    // * Checking the situation on cloud storage
                    exfunc.CheckYandexSpace();
    
                    // * Uploading created file
                    const disk = new yadisk(process.env.YADISK_TOKEN);
                    disk.uploadFile(ready_upload_path, config.yadisk_wav_path + filename_result, err => {
                        if (err) {
                            exfunc.Logger('error', `An error occurred while uploading a WAV file (${track_title}) from the audio library to the cloud`, path.basename(__filename));
                            return message.channel.send(`<@${message.author.id}>\n ${locale.upload_created_error}`);
                        }
                        
                        else {
                            disk.publish(config.yadisk_wav_path + filename_result, (err, down_link) => {
                                if (err) {
                                    exfunc.Logger('error', `An error occurred while publishing a wav file (${track_title}) from the audio library to the cloud`, path.basename(__filename));
                                    return message.channel.send(`<@${message.author.id}>\n ${locale.upload_created_error}`);
                                }
                                
                                else {
                                    fs.unlinkSync(ready_upload_path);
                                    
                                    const wavmake_embed = new Discord.MessageEmbed()
                                    .setColor(config.embed_color_hex)
                                    .setTitle(locale.wav_created_embed.title)
                                    .addFields(
                                        { name: locale.wav_created_embed.name, value: locale.wav_created_embed.value.replace('[filename_result]', filename_result).replace('[down_link]', down_link) }
                                    )
                                    .setFooter( { text: locale.wav_created_embed.footer } );
                                    message.channel.send( { embeds: [wavmake_embed] } );
                                    exfunc.Logger('success', `Request to create a WAV (${track_title}) for user ${message.author.username}#${message.author.discriminator} was successfully completed`, path.basename(__filename)); 
                                }
                            });
                        }
                    });
                });
            }
        });
    }
}