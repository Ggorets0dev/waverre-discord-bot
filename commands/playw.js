const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const DisVoice = require('@discordjs/voice');


var mscqueue = new Map();
var search_base = new Map();


module.exports = {
    name: 'playw',
    aliases: ['plw', 'skipw', 'skw', 'pausew', 'paw', 'resumew', 'rew', 'stopw', 'stw', 'loopw', 'low', 'audinfw', 'auw', 'quuew', 'quw' , 'deletew', 'dew', 'findw', 'fiw', 'choosew', 'chw'],
    description: 'Playing music in voice channels',
    playlists: ['all', 'all_random'],
    async execute(message, cmd, args, config, exfunc, Discord){

        // * Checking if there are problems with permissions or member isnt in VOC
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send(`<@${message.author.id}>\n :anger: **Вы должны находиться в голосовом канале**`);
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.channel.send(`<@${message.author.id}>\n :anger: **У бота не хватает прав на проигрывание музыки**`);
         
        var server_queue = mscqueue.get(message.guild.id);

        if (server_queue && !message.guild.me.voice.channel) {
            server_queue.text_channel.send(`:warning:  **Похоже, не удается получить доступ к голосовому каналу, к которому подключение было создано изначально. Сессия была перезапущена**`);
            exfunc.Logger('warning', `There is a queue, but playback in the voice channel does not work on the server [${message.guild.name}] (id: ${message.guild.id}), deleting the queue`, path.basename(__filename));

            mscqueue.delete(message.member.guild.id);
            search_base.delete(message.member.guild.id);
            server_queue = undefined;
        }

        // * Substitution of commands in case of selecting choosew (chw)
        if (cmd == 'choosew' || cmd == 'chw'){
            if (args.length != 1)            return message.channel.send(`<@${message.author.id}>\n :anger: **Передано неверное количество аргументов**`);
            else if (isNaN(Number(args[0]))) return message.channel.send(`<@${message.author.id}>\n :anger: **Нарушен формат аргумента**`);

            server_search = search_base.get(message.member.guild.id);

            if (!server_search)                                                     return message.channel.send(`<@${message.author.id}>\n :anger: **Поиск еще ни разу не был выполнен, поэтому доступные варианты для добавления в очередь отсутствуют**`);
            else if (Number(args[0]) < 1 || Number(args[0]) > server_search.length) return message.channel.send(`<@${message.author.id}>\n :anger: **Введенный индекс трека выпадает из зоны допустимых значений! (1-${server_search.length})**`);

            // ? search_base.delete(message.member.guild.id);
            
            message.channel.send(`:sparkle:  **Выбор подтвержден, осуществляю подгрузку аудио...**`);

            // * The request was changed on the fly
            cmd = 'plw';
            if (server_search[Number(args[0])-1].type == 'youtube')      args[0] = server_search[Number(args[0])-1].url;
            else if (server_search[Number(args[0])-1].type == 'wavlib')  args[0] = String(server_search[Number(args[0])-1].lib_inx + 1);
        }


        // * Selecting command between aliases (except choosew (chw))
        if (cmd == 'playw' || cmd == 'plw') {

            // * Checking arguments
            if (args.length == 0) return message.channel.send(`<@${message.author.id}>\n :anger: **Передано неверное количество аргументов**`);
            

            // * Check for used space in toplay folder using songs iterating, it might be more than expected
            let predicted_toplay_size = 0;
            for (var pair of mscqueue.entries()) {
                var [guild_id, queue] = [pair[0], pair[1]];
                if (queue.songs) for (song_obj of queue.songs) if (song_obj.type == 'youtube') predicted_toplay_size += song_obj.size; 
            }
            
            if (predicted_toplay_size / 1024 > config.max_toplay_foldersize_gb){
                exfunc.Logger('error', `Storage of audio from Youtube for playback in voice channels is full (max: ${config.max_toplay_foldersize_gb} gb), further uploading via request is impossible`, path.basename(__filename));
                return message.channel.send(`<@${message.author.id}>\n :anger: **Хранилище переполнено, загрузка аудио невозможна до очистки какой-либо очереди**`); 
            }
            else if (predicted_toplay_size / 1024 > config.max_toplay_foldersize_gb / 4 * 3) exfunc.Logger('warning', `Youtube audio storage for playback in voice channels is more than 75% full`, path.basename(__filename));


            // * >>> START WORKING WITH CMD & ARGS >>>
            let playlist_requested = [];
            let playlist_mode = false;
            let song_name;
            let song_path;
            let song_url;
            let song_type;
            let song_size;

            // * Promise for filling vars before filling object with these vars
            var getting_vars = new Promise(async (resolve, reject) => {
                if (args.length > 1 || (args[0].indexOf("youtube") == -1 && args[0].indexOf("youtu.be") == -1 && isNaN(Number(args[0])) && !this.playlists.includes(args[0]))){
                    
                    message.channel.send(':mag_right:  **Похоже, запрос выполнен в виде названия, поиск...**')

                    let query = args.join(' ');
                    args = [];
                    
                    let pause_save = false;
                    if (server_queue && server_queue.player && !server_queue.pause){
                        await server_queue.player.pause();
                        server_queue.pause = true;
                        pause_save = true;
                    }

                    songs_found = await exfunc.FindAudio(query);
                    
                    if (server_queue && server_queue.player && pause_save){
                        await server_queue.player.unpause();
                        server_queue.pause = false;
                    }    
                    
                    // if (!songs_found){
                    //     exfunc.Logger('info', `No videos were found during search (query by ${message.author.username}#${message.author.discriminator}: ${query})`, path.basename(__filename));
                    //     return message.channel.send(`<@${message.author.id}>\n :anger: **Не удалось найти аудиозаписи по данному запросу**`); 
                    // }
                    exfunc.Logger('info', `Around ${songs_found.youtube.length + songs_found.wavlib.length} videos were found during search (query by ${message.author.username}#${message.author.discriminator}: ${query})`, path.basename(__filename));

                    if (songs_found.youtube.length && songs_found.youtube[0].lev >= songs_found.wavlib[0].lev) args[0] = String(songs_found.wavlib[0].lib_inx + 1);
                    else                                                         args[0] = songs_found.youtube[0].url;
                }

                if (args[0].indexOf("youtube") != -1 || args[0].indexOf("youtu.be") != -1){
                    let validation = await exfunc.GetDownloadItag(args[0]);
                    if (!validation) return message.channel.send(`<@${message.author.id}>\n :anger: **Ссылка либо является некорректной, либо ведет к видеозаписи, не имеющей требуемого формата скачивания**`);
                    
                    let [vid_info, download_itag] = [validation.vid_info, validation.itag];
                    if (Number(vid_info.videoDetails.lengthSeconds) / 60 > config.max_toplay_duration_minutes) return message.channel.send(`<@${message.author.id}>\n :anger: **Слишком большая длительность видео, поддерживаются только видеоролики до ${config.max_toplay_duration_minutes} минут(ы)!**`);

                    let filename = `${vid_info.videoDetails.ownerChannelName}_${Math.floor(Math.random() * config.min_file_inx_range * 10)}_${message.guild.id}.webm`;

                    if (!exfunc.isASCII(filename)){
                        filename = `NOTASCII_${Math.floor(Math.random() * config.min_file_inx_range * 100)}_${message.guild.id}.webm`;
                        exfunc.Logger('warning', 'Audio with a channel name not from ASCII encoding was requested, errors may occur', path.basename(__filename));
                    }
                    
                    // * Checking length of video and if it's exists
                    if (Number(vid_info.videoDetails.lengthSeconds) / 60 > config.max_toplay_duration_minutes) return message.channel.send(`<@${message.author.id}>\n :anger: **Слишком большая длительность видео, поддерживаются только видеоролики до ${config.max_toplay_duration_minutes} минут(ы)!**`);
                    else if (fs.existsSync(path.join(__dirname, '..', config.toplay_dirname, filename))) while (fs.existsSync(path.join(__dirname, '..', config.toplay_dirname, filename))) filename = `${vid_info.videoDetails.ownerChannelName}_${Math.floor(Math.random() * config.min_file_inx_range * 10)}_${message.guild.id}.webm`; 
                    
                    req = ytdl(args[0], {format: download_itag}).pipe(fs.createWriteStream(filename));
                    req.on('finish', err => {
                        if (err){
                            exfunc.Logger('error', `Failed to upload video (url: ${args[0]})`, path.basename(__filename));
                            return message.channel.send(`<@${message.author.id}>\n :anger: **Не удается загрузить данное видео**`);
                        }

                        fs.copyFileSync(path.join(__dirname, '..', filename), path.join(__dirname, '..', config.toplay_dirname, filename), fs.constants.COPYFILE_EXCL);
                        fs.unlinkSync(path.join(__dirname, '..', filename));
                        let file_stats = fs.statSync(path.join(__dirname, '..', config.toplay_dirname, filename));

                        if (vid_info.videoDetails.title.split('-').length == 1) song_name = `${vid_info.videoDetails.ownerChannelName} - ${vid_info.videoDetails.title}`;
                        else                                                    song_name = vid_info.videoDetails.title;
                        
                        song_path = path.join(__dirname, '..', config.toplay_dirname, filename);
                        song_url = vid_info.videoDetails.video_url;
                        song_type = 'youtube';
                        song_size = file_stats.size / Math.pow(1024, 2);
                        
                        return resolve();
                    });
                }
                else if (!isNaN(Number(args[0]))){
                    let wavlib = exfunc.GetWavLib();
                    var wavlib_files = wavlib.filenames;
                    var wavlib_tracks = wavlib.titles;
                    if (!isNaN(Number(args[0])) && (Number(args[0]) > wavlib_files.length || Number(args[0]) < 1)) return message.channel.send(`<@${message.author.id}>\n :anger: **Введенный индекс трека выпадает из зоны допустимых значений! (1-${wavlib_files.length})**`);
                    
                    let file_stats = fs.statSync(config.wavlib_path + wavlib_files[Number(args[0])-1]);

                    song_name = wavlib_tracks[Number(args[0])-1];
                    song_path = config.wavlib_path + wavlib_files[Number(args[0])-1];
                    song_url = null;
                    song_type = 'wavlib';
                    song_size = file_stats.size / Math.pow(1024, 2);

                    return resolve();
                }
                else if (this.playlists.includes(args[0])){
                    playlist_mode = true;

                    if (args[0].indexOf('all') != -1){
                        let wavlib = exfunc.GetWavLib();

                        for (let i=0; i < wavlib.filenames.length; i+=1){
                            let file_stats = fs.statSync(config.wavlib_path + wavlib.filenames[i]);
                            
                            let song_object_constructor = {
                                title: wavlib.titles[i], 
                                path: config.wavlib_path + wavlib.filenames[i], 
                                url: null, 
                                type: 'wavlib',
                                size: file_stats.size / Math.pow(1024, 2)
                            };
                            playlist_requested.push(song_object_constructor);
                        }
                        if (args[0] == 'all_random') playlist_requested = playlist_requested.sort(() => Math.random() - 0.5);
                    }
                    message.channel.send(`:card_box:  Выбран плейлист **${args[0]}**, аудиозаписи добавлены в очередь`);
                    return resolve();
                    // * Push here other playlists using else if
                }
            });

            // * Filling song object with vars of song, collected in Promise and start playing
            // * If playlist requested, it's already created, so skip filling, only start playing
            getting_vars.then(() => {
                var song;
                if (!playlist_mode){
                    song = {
                        title: song_name, 
                        path: song_path, 
                        url: song_url, 
                        type: song_type,
                        size: song_size
                    };
                }
                else song = playlist_requested;

                // * First track and no queue in main base
                if (!server_queue){
                    const queue_patent = {
                        voice_channel: voice_channel,
                        text_channel: message.channel,
                        connection: null,
                        player: null,
                        pause: false,
                        loop: false,
                        songs: exfunc.UnpackLayeredArray([song]),
                        todelete: []
                    }

                    mscqueue.set(message.guild.id, queue_patent);
                    server_queue = mscqueue.get(message.guild.id);
    
                    // * Joining VOC or taking connection info from existed one
                    try {
                        const connection = DisVoice.joinVoiceChannel({
                            channelId: message.member.voice.channel.id,
                            guildId: message.channel.guild.id,
                            adapterCreator: message.channel.guild.voiceAdapterCreator,
                        });
                        server_queue.connection = connection;
                        exfunc.Logger('info', `Joined [${server_queue.voice_channel.name}] voice channel on server [${message.guild.name}] (id: ${message.guild.id})`, path.basename(__filename));
                        
                        setTimeout(() => {
                            MusicPlayer(message, server_queue.songs[0], config, exfunc);
                        }, config.timeout_before_play_ms);
                    } catch(err) {
                        mscqueue.delete(message.guild.id);
                        exfunc.Logger('error', `Failed to enter voice channel [${message.member.voice.channel.name}] or play music file on server [${message.channel.guild.name}] (id: ${message.channel.guild.id})`, path.basename(__filename));
                        return message.channel.send(':anger: **Произошла ошибка во время подключения к голосовому каналу или проигрывания аудифайлов, очередь была очищена, а сессия - удалена**');
                    }
                }

                // * There is a queue already in main base
                else {
                    server_queue.songs = exfunc.UnpackLayeredArray([...server_queue.songs, song]);
                    mscqueue.set(message.guild.id, server_queue);
                    if (!song.length) message.channel.send(`:asterisk:  Аудиозапись **${song.title}** добавлена в очередь`);
                }
            }, null);
        }
        
        else if (cmd == 'pausew' || cmd == 'paw'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно приостановить проигрывание по причине отсутствия треков в очереди**`);
            else if (server_queue.pause)                        return message.channel.send(`:pause_button: Трек **${server_queue.songs[0].title}** уже стоит на паузе`);

            await server_queue.player.pause();
            server_queue.pause = true;
            mscqueue.set(message.guild.id, server_queue);
            
            message.channel.send(`:pause_button: Проигрывание трека **${server_queue.songs[0].title}** приостановлено`);
        }
       
        else if (cmd == 'resumew' || cmd == 'rew'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно возобновить проигрывание по причине отсутствия треков в очереди**`);
            else if (!server_queue.pause)                       return message.channel.send(`:arrow_forward: Трек **${server_queue.songs[0].title}** уже проигрывается`);

            await server_queue.player.unpause();
            server_queue.pause = false;
            mscqueue.set(message.guild.id, server_queue);
            
            message.channel.send(`:arrow_forward: Проигрывание трека **${server_queue.songs[0].title}** возобновлено`)
        }
       
        else if (cmd == 'stopw' || cmd == 'stw'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно остановить проигрывание по причине отсутствия треков в очереди**`);
            
            await server_queue.player.unpause();
            await server_queue.player.stop();
            if (server_queue.songs.length != 0){
                for (song of server_queue.songs) if (song.type == 'youtube') server_queue.todelete.push(song.path);
                server_queue.songs = [];
            }
            mscqueue.set(message.guild.id, server_queue);
            
            message.channel.send(` :stop_button:  **Проигрывание аудиозаписи остановлено, очередь полностью очищена**`);
        }

        else if (cmd == 'loopw' || cmd == 'low'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно включить/отключить зацикливание трека по причине его отсутствия**`);
            
            if (server_queue.loop){
                server_queue.loop = false;
                message.channel.send(`:arrows_counterclockwise: Зацикливание трека было **отключено**`);
            }
            else{
                server_queue.loop = true;
                message.channel.send(`:arrows_counterclockwise: Зацикливание трека было **включено**`);
            }
            
            mscqueue.set(message.guild.id, server_queue);
        }

        else if (cmd == 'skipw' || cmd == 'skw'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно пропустить трек по причине его отсутствия**`);
            
            await server_queue.player.stop();

            message.channel.send(`:fast_forward: Аудиозапись **${server_queue.songs[0].title}** была пропущена`);
        }

        else if (cmd == 'audinfw' || cmd == 'auw'){
            if (args.length != 0)                                                           return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player || !server_queue.songs[0])       return message.channel.send(`:interrobang:  **Невозможно отобразить данные о проигрывании по причине его отсутствия**`);
            
            let loop_status;
            let playing_title;
            if (server_queue.loop)  loop_status = 'Включено';
            else                    loop_status = 'Отключено';
            if (server_queue.pause) playing_title = ':pause_button:  Пауза';
            else                    playing_title = ':eight_spoked_asterisk:  Играет';

            audinfw_embed = new Discord.MessageEmbed()
            .setColor(config.embed_color_hex)
            .setTitle(':headphones:  Аудиоплеер')
            .addFields(
                { name: ':arrows_counterclockwise:  Зацикливание', value: `Статус: **${loop_status}**` },
                { name: playing_title, value: `Аудиозапись: **${server_queue.songs[0].title}**` },
                { name: ':mailbox:  Адрес трека', value: `Ресурс: **${server_queue.songs[0].type}**` }
            );
            message.channel.send({embeds: [audinfw_embed]});
        }

        else if (cmd == 'queuew' || cmd == 'quw'){
            if (args.length != 0)                               return message.channel.send(`<@${message.author.id}>\n :anger: **У данной функции не может быть аргументов**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно отобразить данные об очереди, так как ни один трек не проигрывается**`);
            
            let songs_qu = server_queue.songs;

            if (songs_qu.length == 1)                           return message.channel.send(`:card_box:  **Аудиозаписи в очереди отсутствуют**`);

            let embed_inx = 1;
            let buffer;
            let queue_embed;
            let last_used_inx = 1;
            while (last_used_inx < songs_qu.length){
                buffer = "";
                while (last_used_inx < songs_qu.length && buffer.length + songs_qu[last_used_inx].title.length < 1010){
                    buffer += (`**${last_used_inx})** ` + songs_qu[last_used_inx].title + '\n');
                    last_used_inx += 1;
                }
                queue_embed = new Discord.MessageEmbed()
                .setColor(config.embed_color_hex)
                .setTitle(':card_box:  Очередь проигрывания')
                .addFields(
                    { name: `ℹ️ Список треков в очереди (стр ${embed_inx}):`, value: buffer }
                );
                message.channel.send({embeds: [queue_embed]});
                embed_inx += 1;
            }
        }

        else if (cmd == 'deletew' || cmd == 'dew'){
            if (args.length != 2)                               return message.channel.send(`<@${message.author.id}>\n :anger: **Передано неверное количество аргументов**`);
            else if (isNaN(Number(args[1])) || Number(args[1]) < 1 || (args[0] != 'last' && args[0] != 'num'))  return message.channel.send(`<@${message.author.id}>\n :anger: **Аргумент(ы) передан(ы) в неправильном формате**`);
            else if (!server_queue || !server_queue.player)     return message.channel.send(`:interrobang:  **Невозможно удалить аудиозаписи из очереди, так как ни один трек не проигрывается**`);
        
            let [mode, number] = [args[0], Number(args[1])];
            let songs_qu = server_queue.songs;

            if (mode == 'last'){
                if (songs_qu.length == 1)                        return message.channel.send(`:card_box:  **Аудиозаписи в очереди отсутствуют, удаление треков из нее невозможно**`);
                else if (songs_qu.length - 1 < number)           return message.channel.send(`:interrobang:  **Количество запрошенных для удаления из очереди аудиозаписей не должно превышать размер очереди!**`);               
            
                server_queue.songs = songs_qu.slice(0, songs_qu.length - number);
            
                message.channel.send(`:put_litter_in_its_place:  Из очереди были удалены последние **${number}** аудиозаписей`);
            }
            
            else if (mode == 'num'){
                if (!songs_qu[number])                           return message.channel.send(`:interrobang:  **Аудиозаписи с таким индексом в очереди не существует**`);                   
            
                songs_qu.splice(number, 1);
                server_queue.songs = songs_qu;
            
                message.channel.send(`:put_litter_in_its_place:  Из очереди удалена аудиозапись с индексом **${number}**`);
            }

            mscqueue.set(message.guild.id, server_queue);
        }

        else if (cmd == 'findw' || cmd == 'fiw'){
            // ! Block protection is disabled
            //let pause_save = false;
            // if (server_queue && server_queue.player && !server_queue.pause){
            //     await server_queue.player.pause();
            //     server_queue.pause = true;
            //     pause_save = true;
            // }
            
            let query = args.join(' ');
            let songs_found = await exfunc.FindAudio(query);

            let all_music = [...songs_found.wavlib, ...songs_found.youtube];

            // ! Block protection is disabled
            // if (server_queue && server_queue.player && pause_save){
            //     await server_queue.player.unpause();
            //     server_queue.pause = false;
            // }

            
            exfunc.Logger('info', `Around ${all_music.length} videos were found during search (query by ${message.author.username}#${message.author.discriminator}: ${query})`, path.basename(__filename));


            search_base.set(message.member.guild.id, all_music);
            
            let wavlib_value = '';
            let youtube_value = '';
            
            for (let i=0; i < songs_found.wavlib.length; i += 1) wavlib_value += `**(${i+1})** ${songs_found.wavlib[i].title}\n\n`;

            if (songs_found.youtube.length) for (let i=0; i < songs_found.youtube.length; i += 1) youtube_value += `**(${i+6})** ${songs_found.youtube[i].title} *(${songs_found.youtube[i].duration_tmstmp})*\n\n`
            else youtube_value = ':anger:  Не найдено ни одного результата';
            

            findw_embed = new Discord.MessageEmbed()
            .setColor(config.embed_color_hex)
            .setTitle(':mag_right:  Поиск музыки')
            .addFields(
                { name: ':card_box: **Аудиотека WAV**', value: wavlib_value},
                { name: ':globe_with_meridians:  **Youtube**', value: youtube_value}
            )
            .setFooter( { text: 'ℹ️ Используйте >choosew (chw) [inx] для выбора номера трека, который должен быть добавлен в очередь'} );
            return message.channel.send({embeds: [findw_embed]});
        }
    }
}


const MusicPlayer = async (msg, song, config, exfunc) => {
    var song_queue = mscqueue.get(msg.member.guild.id);

    // * Checking if song is undefined, so it's end of queue
    if (!song) {
        song_queue.connection.destroy();
        
        // * Cleaning old music files
        if (song_queue.todelete.length){
            setTimeout(() => {
                for (filepath of song_queue.todelete) if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            }, 1000);
        }
    
        mscqueue.delete(msg.guild.id);
        exfunc.Logger('info', `Left [${song_queue.voice_channel.name}] voice channel on server [${msg.guild.name}] (id: ${msg.guild.id})`, path.basename(__filename));
        return song_queue.text_channel.send(':zzz: **Выхожу из голосового канала по причине отсутствия треков в очереди**');
    }

    const stream = DisVoice.createAudioResource(song.path);

    const aud_player = DisVoice.createAudioPlayer();
    aud_player.play(stream);
    const subscription = song_queue.connection.subscribe(aud_player);
    
    song_queue.player = aud_player;
    
    exfunc.Logger('info', `${song.title} (type: ${song.type}) is now playing on server [${msg.guild.name}] (id: ${msg.guild.id})`, path.basename(__filename));
    mscqueue.set(msg.member.guild.id, song_queue);
    
    // * Cleaning old music files
    if (song_queue.todelete.length){
        setTimeout(() => {
            for (filepath of song_queue.todelete) if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }, 1000);
    }

    // * Listening for end of playing
    aud_player.on(DisVoice.AudioPlayerStatus.Idle, () => {
        aud_player.stop();
        subscription.unsubscribe();

        let song_queue_recheck = mscqueue.get(msg.member.guild.id);
        if (!song_queue_recheck.loop){
            song_queue.songs.shift();
            if (song.type == 'youtube'){
                song_queue_recheck.todelete.push(song.path);
                mscqueue.set(msg.member.guild.id, song_queue_recheck);
            }
        }
        setTimeout(() => {
            MusicPlayer(msg, song_queue.songs[0], config, exfunc);
        }, config.timeout_before_play_ms);
    });
    if (!song_queue.loop) song_queue.text_channel.send(`:musical_note:  Включаю трек: **${song.title}**`);
}