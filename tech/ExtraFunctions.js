const path = require('path');
const yadisk = require('yandex-disk').YandexDisk;
const fs = require('fs');
const ytdl = require('ytdl-core');
const levenshtein = require('fast-levenshtein');
const yts = require('yt-search');
const chalk = require("chalk");

const config = require(path.join(__dirname, '..', 'WREconfig.json'));

module.exports = {
    async Logger(type='INFO', msg, module_name=path.basename(__filename)) {
        type = type.toUpperCase();
        let date = (new Date()).toLocaleString().split(',').join('');
        let type_colored;
        let msg_colored; 

        if      (type == "ERROR")      [type_colored, msg_colored] = [chalk.bold.red(type), chalk.bold.red(msg)]
        else if (type == "SUCCESS")    [type_colored, msg_colored] = [chalk.bold.green(type), chalk.bold.green(msg)]     
        else if (type == "WARNING")    [type_colored, msg_colored] = [chalk.bold.yellow(type), chalk.bold.yellow(msg)]
        else if (type == "INFO")       [type_colored, msg_colored] = [chalk.bold.white(type), chalk.bold.white(msg)]   
        else                           return console.log('Unknown type of request in Logger!');

        let info_part = ` | ${type_colored}`;
        for (let i=0; i < 8 - type.length; i+=1) info_part += ' ';

        let log_tocons = ' ' + chalk.bold.cyan(date) + info_part + '| ' + chalk.cyan(`<${module_name}>: `) + msg_colored;
        let log_tofile = date + info_part.split(type_colored).join(type) + '| ' + `<${module_name}>: ` + msg + '\n'; 
        
        await setTimeout(() => {
            console.log(log_tocons);
            fs.appendFile('WRE_LOGS.log', log_tofile, (err)=>{ if (err) return console.log(err); });
        }, Math.floor(Math.random()*100));
    },

    GetWavLib(register='normal') {
        register = register.toLowerCase();
        if (register != "normal" && register != "lower" && register != "upper"){
            this.Logger('error', 'Wrong register was specified when requesting a WAV audio library', path.basename(__filename));
            return undefined;
        }

        var wavlib_files = fs.readdirSync(config.wavlib_path);
        var wavlib_tracks = [];
        for (let inx = 0; inx < wavlib_files.length; inx+=1){
            track = wavlib_files[inx];
            track = track.substr(0, track.length-4);
            track = this.FilterTrackTitle(track);
            wavlib_tracks.push(track);
        }

        if (register == "lower"){
            for (let i = 0; i < wavlib_files.length; i+=1){
                wavlib_files[i] = wavlib_files[i].toLowerCase();
                wavlib_tracks[i] = wavlib_tracks[i].toLowerCase();
            }
        }
        else if (register == "upper"){
            for (let i = 0; i < wavlib_files.length; i+=1){
                wavlib_files[i] = wavlib_files[i].toUpperCase();
                wavlib_tracks[i] = wavlib_tracks[i].toUpperCase();
            }
        }

        return {filenames: wavlib_files, titles: wavlib_tracks};
    },

    async GetDownloadItag(url) {
        let required_itags = [251, 250, 249];

        try{
            validate = await ytdl.validateURL(url);
            if (!validate){
                this.Logger('error', `Unsuccessful attempt to verify access to the video and get it's information (url: ${url})`, path.basename(__filename));
                return undefined;
            }
            
            let itags_available = [];
            let vid_info = await ytdl.getInfo(url);
            for (frmt of vid_info.formats) if (required_itags.includes(frmt.itag)) itags_available.push(frmt.itag);
            
            if (!itags_available.length){
                this.Logger('error', `Requested video does not have the required format for downloading (url: ${url})`, path.basename(__filename));
                return undefined;
            }

            itags_available.sort((e1,e2) => {
                if (e1 > e2) return -1;
                if (e1 < e2) return 1;
                return 0;
            });

            return { vid_info: vid_info, itag: String(itags_available[0]) };

        } catch(error){
            this.Logger('error', `Unknown error during link check (url: ${url})`, path.basename(__filename));
            return undefined;
        }
    },

    async FindAudio(query) {
        let wavlib = this.GetWavLib();
        let [wavlib_tracks, wavlib_filenames] = [wavlib.titles, wavlib.filenames];
        
        query = query.toLowerCase();
        let search_results = await yts(query);

        let youtube_videos = [];
        for (let vid of search_results.videos){
            if (vid.seconds / 60 > config.max_toplay_duration || vid.views < 5000) continue;

            let verified_title;
            if (vid.title.split('-').length == 1) verified_title = `${vid.author.name} - ${vid.title}`
            else verified_title = vid.title;

            youtube_videos.push({
                title: verified_title,
                channel: vid.author.name,
                url: vid.url,
                lev: levenshtein.get(query, this.FilterTrackTitle(vid.title).toLowerCase()),
                views: vid.views,
                duration_tmstmp: vid.timestamp,
                type: 'youtube'
            });
        }

        let wavlib_videos = [];
        for (let i=0; i < wavlib_tracks.length; i+=1){
            wavlib_videos.push({
                title: wavlib_tracks[i],
                lib_inx: i,
                lev: levenshtein.get(query, wavlib_tracks[i].toLowerCase()),
                type: 'wavlib'
            });
        }

        youtube_videos.sort((o1, o2) => {
            if (o1.lev < o2.lev) return -1;
            if (o1.lev > o2.lev) return 1;
            
            if (o1.views < o2.views) return 1;
            if (o1.views > o2.views) return -1;
            return 0;
        });

        wavlib_videos.sort((o1, o2) => {
            if (o1.lev < o2.lev) return -1;
            if (o1.lev > o2.lev) return 1;
            return 0;
        });

        if (youtube_videos.length > 5)  youtube_videos.splice(5, youtube_videos.length-5);
        if (wavlib_videos.length > 5)   wavlib_videos.splice(5, wavlib_videos.length-5);

        return { youtube: youtube_videos, wavlib: wavlib_videos };
    },

    CheckYandexSpace() {
        let disk = new yadisk(process.env.YADISK_TOKEN);
        disk.readdir(config.yadisk_wav_path, (err, tracks_uploaded) => {
            if (err) {
                this.Logger('error', `An error occurred while reading the cloud`, path.basename(__filename));
                console.log(err);
            }

            else if (tracks_uploaded.length > config.max_wavfiles_uploaded - 1){
                let audiofiles_ondisk = [];

                for (file of tracks_uploaded) audiofiles_ondisk.push({yad_obj: file, tmstmp: Number(new Date(file.creationDate).getTime())});

                audiofiles_ondisk.sort((o1, o2) => {
                    if (o1.tmstmp > o2.tmstmp) return -1;
                    if (o1.tmstmp < o2.tmstmp) return 1;
                    return 0;
                });

                let files_to_del = audiofiles_ondisk.slice(0, tracks_uploaded.length-config.max_wavfiles_uploaded+1);
                
                for (file_td of files_to_del){
                    let filename = file_td.yad_obj.displayName;
                    let file_path = config.yadisk_wav_path + filename;
                    disk.remove(file_path, err => {
                        if (err) this.Logger("error", `An error occurred while deleting a WAV file (${filename}) to clear space`, path.basename(__filename));
                        else     this.Logger("info", `WAV file (${filename}) was deleted from cloud to clear space`, path.basename(__filename)); 
                    });
                }
            }
        }); 
    },

    async StartupPreparing() {
        let available_settings_filenames = ['towavlib_artists.txt', 'todel_title_parts.txt'];
        let startup_whitelist_comp = {
            todel_title_parts: ['(16bit_1500kbs)',
                '(32bit_3000kbs)',
                '(Audio)',
                '(Video)',
                '[Monstercat Release]',
                '(Official Audio)',
                '(Lyrics)',
                '(Official Lyrics)',
                '(Official Visualizer)',
                '(Extended Mix)',
                '[Club_Mix]',
                '(Radio Edit)',
                '(Official Lyric Video)'],
        }

        if (!fs.existsSync(path.join(__dirname, '..', config.toplay_dirname))) fs.mkdirSync(path.join(__dirname, '..', config.toplay_dirname));
        else {
            toplay_files = fs.readdirSync(path.join(__dirname, '..', config.toplay_dirname));
            for (toplay_f of toplay_files) fs.unlinkSync(path.join(__dirname, '..', config.toplay_dirname, toplay_f));
        }
        
        if (!fs.existsSync(path.join(__dirname, '..', config.sandbox_dirname))) fs.mkdirSync(path.join(__dirname, '..', config.sandbox_dirname));
        else {
            sandbox_files = fs.readdirSync(path.join(__dirname, '..', config.sandbox_dirname));
            for (sandbox_f of sandbox_files) fs.unlinkSync(path.join(__dirname, '..', config.sandbox_dirname, sandbox_f));
        }

        if (!fs.existsSync(path.join(__dirname, '..', config.settings_dirname))) {
            fs.mkdirSync(path.join(__dirname, '..', config.settings_dirname));
            for (settings_file of available_settings_filenames) fs.openSync(path.join(__dirname, '..', config.settings_dirname, settings_file), 'w');
            
            fs.appendFileSync(path.join(__dirname, '..', config.settings_dirname, 'todel_title_parts.txt'), startup_whitelist_comp.todel_title_parts.join('\n'));
        
            this.Logger('warning', 'Сustom settings folder was not detected. It was created along with the special files and their initial data, if it exists', path.basename(__filename))
        }
        else {
            settings_files = fs.readdirSync(path.join(__dirname, '..', config.settings_dirname));
            for (settings_f of settings_files) if (available_settings_filenames.indexOf(settings_f) == -1) fs.unlinkSync(path.join(__dirname, '..', config.settings_dirname, settings_f)); 
        }

        home_files = fs.readdirSync(path.join(__dirname, '..'));
        for (home_f of home_files) if (home_f.endsWith('.webm')) fs.unlinkSync(path.join(__dirname, '..', home_f));
    
        this.Logger('success', 'Successfully finished preparing directories and files', path.basename(__filename));
    },

    isLibWorthy(track_title) {
		track_title = track_title.toLowerCase();
        let towavlib_artists_path = path.join(__dirname, '..', config.settings_dirname, 'towavlib_artists.txt');

        if (fs.existsSync(towavlib_artists_path) && fs.readFileSync(towavlib_artists_path, 'utf-8').length != 0) {
            let wavlib = this.GetWavLib('lower');
            let [wavlib_files, wavlib_tracks] = [wavlib.filenames, wavlib.titles];

            whitelist_artists = fs.readFileSync(towavlib_artists_path, 'utf-8').split('\n');
            for (let i = 0; i < whitelist_artists.length; i+=1){
				if (whitelist_artists[i].indexOf('\r') != -1) whitelist_artists[i] = whitelist_artists[i].replace('\r', '');
				if (whitelist_artists[i].length < 3) whitelist_artists[i] = '###';
			}

			let track_parts = track_title.split('-');
			let artist_of_track = track_parts[0];
			if (artist_of_track == track_title) artist_of_track = track_title.slice(0, track_title.length);

            for (artist of whitelist_artists) if (artist_of_track.indexOf(artist.toLowerCase()) != -1 && wavlib_files.indexOf(track_title) == -1 && wavlib_tracks.indexOf(track_title) == -1) return true;
        }
        else if (fs.existsSync(towavlib_artists_path)) this.Logger('warning', 'No artists in the whitelist are detected, adding to the WAV audio library does not happen', path.basename(__filename));
		else {
            if (!fs.existsSync(path.join(__dirname, '..', config.settings_dirname))) fs.mkdirSync(path.join(__dirname, '..', config.settings_dirname));
            
            fs.openSync(path.join(__dirname, '..', config.settings_dirname, 'towavlib_artists.txt'), 'w');
            this.Logger('warning', 'Artist whitelist file wasnt found in the settings folder, аn empty file was created', path.basename(__filename));
        }                                        

        return false;
    },

    isASCII(str){
        return /^[\x00-\x7F]*$/.test(str);
    },

    FilterTrackTitle(title) {
        todel_title_parts_path = path.join(__dirname, '..', config.settings_dirname, 'todel_title_parts.txt');
        todel = ['`', '"', "'"];

        if (fs.existsSync(todel_title_parts_path) && fs.readFileSync(todel_title_parts_path, 'utf-8').length != 0) {
            todel = [...todel, ...fs.readFileSync(todel_title_parts_path, 'utf-8').split('\n')];
            for (let i = 0; i < todel.length; i+=1) if (todel[i].indexOf('\r') != -1) todel[i] = todel[i].replace('\r', '');
        }
        
        for (elem_td of todel) while (title.indexOf(elem_td) != -1) title = title.replace(elem_td, '');
        return title;
    },

    UnpackLayeredArray(array) {
        for (let i = 0; i < array.length; i += 1){
            if (array[i].length){
                const subarray = array.slice(0, i);
                array = [...subarray, ...this.UnpackLayeredArray(array[i])];
            }
        }
        return array;
    }
}