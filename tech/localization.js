const path = require('path');

const config = require(path.join(__dirname, '..', 'WREconfig.json'));
const package = require(path.join(__dirname, '..', 'package.json'));


module.exports = {
    RUS: {
        arg_wrong_count_error: ':anger: **Передано неверное количество аргументов**',
        arg_value_error: ':anger: **Передан некорректный аргумент**',
        url_invalid_error: ':anger: **Ссылка либо является некорректной, либо ведет к видеозаписи, не имеющей требуемого формата скачивания**',
        long_video_create_error: `:anger: **Слишком большая длительность видео, поддерживаются только видеоролики до ${config.max_create_duration_minutes} минут(ы)!**`,
        convert_error: ':anger: **Произошла ошибка во время конвертирования, повторите свой запрос позже или выберите другую видеозапись**',
        upload_created_error: ':anger: **Произошла ошибка во время загрузки файла на облако, повторите свой запрос позже или выберите другую видеозапись**',
        track_index_error: ':anger: **Введенный индекс трека выпадает из зоны допустимых значений (1-[wavlib_files.length])**',
        upload_wavlib_error: ':anger: **Не удалось загрузить аудиофайл, повторите свой запрос позже или выберите другую аудиозапись**',
        not_in_vch_error: ':anger: **Вы должны находиться в голосовом канале**',
        no_permissions_vch_error: ':anger: **Недостаточно прав на сервере для проигрывания музыки**',
        no_audio_search_error: ':anger: **Поиск еще ни разу не был выполнен, поэтому доступные варианты для добавления в очередь отсутствуют**',
        storage_full_playing_error: ':anger: **Хранилище на хосте переполнено, загрузка аудио невозможна до очистки какой-либо очереди**',
        long_video_playing_error: `:anger: **Слишком большая длительность видео, поддерживаются только видеоролики до ${config.max_toplay_duration_minutes} минут(ы)!**`,
        upload_requested_error: ':anger: **Не удается скачать данное видео для последующего проигрывания, повторите свой запрос позже или выберите другую видеозапись**',
        connect_playing_error: ':anger: **Произошла ошибка во время подключения к голосовому каналу или проигрывания аудиофайлов, очередь очищена, сессия удалена**',
        empty_queue_error: ':interrobang:  **Невозможно взаимодействовать с проигрыванием по причине отсутствия треков в очереди**',
        wrong_indexes_deliting_queue_error: ':interrobang:  **Не удалось удалить указанные аудизаписи, проверьте указанное значение**',
        no_audio_found_youtube_error: ':anger: Не найдено ни одного трека по данному запросу',


        filename_changed_warning: ':warning: **Имя файла было заменено на шаблонное из-за недопустимых символов**',
        session_restarted_vch_warning: ':warning:  **Не удается получить доступ к голосовому каналу, к которому подключение было создано изначально. Сессия была перезапущена**',


        query_processing_info: ':information_source: **Запрос принят в обработку...**',
        wavlib_added_info: ' ℹ️ **Данный трек был добавлен в аудиотеку WAV**',
        upload_wavlib_info: ':clock3: Загружаю на облако запрошенный аудиофайл: **[wavlib_tracks[Number(args[0])-1]].wav**',
        track_found_info: ':sparkle:  **Выбор подтвержден, осуществляю подгрузку аудио...**',
        search_byname_processing_info: ':mag_right: **Похоже, запрос выполнен в виде названия, поиск...**',
        playlist_requested_info: ':card_box:  Выбран плейлист **[playlist_name]**, аудиозаписи добавлены в очередь',
        track_queue_added_info: ':asterisk:  Трек **[song.title]** добавлен в очередь',
        already_paused_info: ':pause_button: Трек **[track_title]** уже стоит на паузе',
        successfully_paused_info: ':pause_button: Проигрывание трека **[track_title]** приостановлено',
        already_playing_info: ':arrow_forward: Трек **[track_title]** уже проигрывается',
        successfully_playing_info: ':arrow_forward: Проигрывание трека **[track_title]** возобновлено',
        successfully_stoped_info: ' :stop_button:  **Проигрывание аудиозаписи остановлено, очередь полностью очищена**',
        successfully_loop_enabled_info: ':arrows_counterclockwise: Зацикливание трека было **включено**',
        successfully_loop_disabled_info: ':arrows_counterclockwise: Зацикливание трека было **выключено**',
        successfully_skipped_info: ':fast_forward: Трек **[track_title]** была пропущен',
        empty_queue_info: ':card_box:  **Аудиозаписи в очереди отсутствуют**',
        range_deleted_queue_info: ':put_litter_in_its_place:  Из очереди были удалены последние **[n]** аудиозаписей',
        index_deleted_queue_info: ':put_litter_in_its_place:  Из очереди удалена аудиозапись с номером **[n]**',
        leave_vch_empty_queue_info: ':zzz: **Выхожу из голосового канала по причине отсутствия треков в очереди**',
        starting_track_info: ':musical_note: Включаю трек: **[track_title]**',


        wav_created_embed: {
            title: '🤟 Создание WAV',
            name: '✅ Файл загружен',
            value: 'Файл **[filename_result]** успешно загружен на облако и доступен по ссылке: [down_link]',
            footer: `ℹ️ Одновременно на облаке может храниться до ${config.max_wavfiles_uploaded} WAV файлов. Если ссылка является недействительной, стоит повторить запрос`
        },
        wavlib_embed: {
            title: '🧾 Аудиотека WAV',
            name: `ℹ️ Список доступных треков (стр [embed_inx]):`
        },
        wavlib_upload_embed: {
            title: '🤟 Загрузка WAV',
            name: '✅ Файл загружен',
            value: 'Файл **[track_title]** успешно загружен на облако и доступен по ссылке: [down_link]',
            footer: `ℹ️ Одновременно на облаке может храниться до ${config.max_wavfiles_uploaded} WAV файлов. Если ссылка является недействительной, стоит повторить запрос` 
        },
        about_embed: {
            title: ':gear:  Настройки и Характеристики',
            
            settings_name: ':tools: Настройки',
            specifications_name: ':page_facing_up: Характеристики',
            
            settings_value: `Максимальная длительность видеозаписей, доступных для конвертирования: **${config.max_create_duration_minutes} мин**\n\n` +
                            `Максимальная длительность видеозаписей, доступных для проигрывания в голосовых каналах: **${config.max_toplay_duration_minutes} мин**\n\n` +
                            `Максимальное количество файлов WAV, хранящихся на облаке одновременно: **${config.max_wavfiles_uploaded} шт**`,
            specifications_value:   `Версия: **${package.version}**\n\n` +
                                    'Платформа: **NodeJS**\n\n' +
                                    `Библиотека кодирования аудио: **Tweetnacl** *(https://www.npmjs.com/package/tweetnacl)*\n\n` +
                                    'Инструмент воспроизведения аудио: **FFmpeg-static** *(https://www.npmjs.com/package/ffmpeg-static)*\n\n' +
                                    'Формат видео с Youtube: **Webm (audio-codec: Opus)**',

            footer: 'ℹ️ Настройки являются константными и не подлежат изменению пользователями'
        },
        help_embed: {
            title: ':bookmark: Документация',
            
            creating_name: ':hammer_pick: Создание и управление',
            playing_name_1: ':headphones: Проигрывание **(1)**',
            playing_name_2: ':headphones: Проигрывание **(2)**',

            creating_value: '**makew** [*<quality>*] [*<url>*] - Создание файла WAV из ролика Youtube (*quality: normal / best*)\n\n' +
                                '**libw** [*<show/inx>*] - Вывод аудиотеки WAV (*указывается "show"*) или загрузка на облако файла под указанным индексом (*указывается номер*)',
            playing_value_1: '**playw (plw)** [*<url/inx/all/all_random/query>*] - Проигрывание аудиофайлов: из аудиотеки WAV (*указывается номер*), из Youtube (*указывается ссылка*), всех WAV по порядку (*указывается "all"*), всех WAV в случайном порядке (*указывается "all_random"*), по ключевым словам (*указывается набор слов*)\n\n' +
                                '**pausew (paw)** - Приостановка проигрования\n\n' +
                                '**resumew (rew)** - Возобновление проигрывания\n\n' +
                                '**skipw (skw)** - Пропуск играющего в данный момент трека\n\n' +
                                '**stopw (stw)** - Остановка проигрывания и полная очистка очереди\n\n' +
                                '**loopw (low)** - Зацикливание играющего в данный момент трека (отключается повторным вводом команды)\n\n' +
                                '**audinfw (auw)** - Информация о проигрывании\n\n' + 
                                '**queuew (quw)** - Просмотр очереди\n\n' +
                                '**deletew (dew)** [*<last/num>*] [*n*] - Удаление из очереди *n* последних аудиозаписей (указывается *last* и *кол-во*) или удаление одного определенного трека (указывается *num* и *номер*)',
            playing_value_2: '**findw (fiw)** [*<query>*] - Поиск аудиозаписи в аудиотеке WAV и на Youtube\n\n' + 
                                '**choosew (chw)** [*<inx>*] - Добавление в очередь трека под указанным номером из базы найденных аудиозаписей (доступно только после вызова *findw*)',
        },
        audinf_embed: {
            title: ':headphones:  Аудиоплеер',

            loop_name: ':arrows_counterclockwise:  Зацикливание',
            loop_enabled_value: 'Статус: **Включено**',
            loop_disabled_value: 'Статус: **Выключено**',

            playing_name: ':eight_spoked_asterisk:  Играет',
            paused_name: ':pause_button:  Пауза',
            audio_value: 'Аудиозапись: **[track_title]**',
            
            track_adress_name: ':mailbox:  Адрес трека',
            track_adress_value: 'Ресурс: **[track_adress]**'
        },
        queue_embed: {
            title: ':card_box:  Очередь проигрывания',
            name: 'ℹ️ Список треков в очереди (стр [embed_inx]):'
        },
        find_embed: {
            title: ':mag_right:  Поиск музыки',

            wavlib_name: ':card_box: **Аудиотека WAV**',
            youtube_name: ':globe_with_meridians:  **Youtube**',

            footer: 'ℹ️ Используйте >choosew (chw) [n] для выбора номера трека, который должен быть добавлен в очередь'
        }
    },

    ENG: {
        arg_wrong_count_error: ':anger: **Wrong number of arguments sent**',
        arg_value_error: ':anger: **Incorrect argument is sent**',
        url_invalid_error: ':anger: **Link is either incorrect or leads to a video that does not have the required download format**',
        long_video_create_error: `:anger: **Video duration is too long, only videos up to ${config.max_create_duration_minutes} minutes!**`,
        convert_error: ':anger: **Error occurred during conversion, please try again later or choose another video**',
        upload_created_error: ':anger: **Error occurred while uploading the file to the cloud, please try again later or choose another video**',
        track_index_error: ':anger: **Entered track index falls out of the zone of valid values (1-[wavlib_files.length])**',
        upload_wavlib_error: ':anger: **Audio file could not be uploaded, please repeat your request later or select another one**',
        not_in_vch_error: ':anger: **You must be in a voice channel**',
        no_permissions_vch_error: ':anger: **Not enough permissions on this server to play music**',
        no_audio_search_error: ':anger: **Search has never been done, so there are no available options to add to the queue**',
        storage_full_playing_error: ':anger: **Storage on host is full, audio cannot be downloaded until some queue is cleared**',
        long_video_playing_error: `:anger: **Video duration is too long, only videos up to ${config.max_toplay_duration_minutes} minutes!**`,
        upload_requested_error: ':anger: **Cannot download this video for later playback, repeat your request later or select another video**',
        connect_playing_error: ':anger: **Error occurred while connecting to the voice channel or playing audio files, queue cleared, session deleted**',
        empty_queue_error: ':interrobang:  **Cannot work with playback because there are no tracks in the queue**',
        wrong_indexes_deliting_queue_error: ':interrobang:  **Failed to delete the specified recordings, check the specified value**',
        no_audio_found_youtube_error: ':anger: No tracks for this query were found',


        filename_changed_warning: ':warning: **File name was changed to a template name because of invalid characters**',
        session_restarted_vch_warning: ':warning:  **Cannot access the voice channel to which the connection was originally created. The session was restarted**',


        query_processing_info: ':information_source: **Request accepted for processing...**',
        wavlib_added_info: ' ℹ️ **This track was added to the WAV audio library**',
        upload_wavlib_info: ':clock3: Uploading the requested audio file to the cloud: **[wavlib_tracks[Number(args[0])-1]].wav**',
        track_found_info: ':sparkle:  **Choice confirmed, downloading audio...**',
        search_byname_processing_info: ':mag_right: **Looks like the query is in title form, searching...**',
        playlist_requested_info: ':card_box:  Playlist **[playlist_name]** is selected, audio recordings are added to the queue',
        track_queue_added_info: ':asterisk:  Track **[song.title]** was added to queue',
        already_paused_info: ':pause_button: Track **[track_title]** is already paused',
        successfully_paused_info: ':pause_button: Track **[track_title]** is paused',
        already_playing_info: ':arrow_forward: Track **[track_title]** is already playing',
        successfully_playing_info: ':arrow_forward: Track playback **[track_title]** has been resumed',
        successfully_stoped_info: ' :stop_button:  **Track playback stopped, queue completely cleared**',
        successfully_loop_enabled_info: ':arrows_counterclockwise: Track looping has been **enabled**',
        successfully_loop_disabled_info: ':arrows_counterclockwise: Track looping has been **disabled**',
        successfully_skipped_info: ':fast_forward: Track **[track_title]** has been skipped',
        empty_queue_info: ':card_box:  **There are no tracks in the queue**',
        range_deleted_queue_info: ':put_litter_in_its_place:  Last **[n]** tracks were removed from the queue',
        index_deleted_queue_info: ':put_litter_in_its_place:  Track with the **[n]** index was removed from queue',
        leave_vch_empty_queue_info: ':zzz: **Quitting the voice channel due to lack of tracks in the queue**',
        starting_track_info: ':musical_note: Playing track: **[track_title]**',


        wav_created_embed: {
            title: '🤟 WAV creation',
            name: '✅ File uploaded',
            value: 'File **[filename_result]** has been successfully uploaded to the cloud and is available via link: [down_link]',
            footer: `ℹ️ Up to ${config.max_wavfiles_uploaded} WAV files can be stored on the cloud at one time. If the link is invalid, it is worth repeating the request`
        },
        wavlib_embed: {
            title: '🧾 WAV audio library',
            name: `ℹ️ List of available tracks (p. [page_inx]):`
        },
        wavlib_upload_embed: {
            title: '🤟 WAV uploading',
            name: '✅ File uploaded',
            value: 'File **[track_title]** has been successfully uploaded to the cloud and is available via link: [down_link]',
            footer: `ℹ️ Up to ${config.max_wavfiles_uploaded} WAV files can be stored on the cloud at one time. If the link is invalid, it is worth repeating the request`
        },
        about_embed: {
            title: ':gear: Settings and Specifications',
            
            settings_name: ':tools: Settings',
            specifications_name: ':page_facing_up: Specifications',
            
            settings_value: `Maximum duration of videos available for conversion: **${config.max_create_duration_minutes} minutes**\n\n` +
                            `Maximum duration of video recordings available for playback in voice channels: **${config.max_toplay_duration_minutes} minutes**\n\n` +
                            `Maximum number of WAV files stored in the cloud at one time: **${config.max_wavfiles_uploaded} pcs**`,
            specifications_value:   `Version: **${package.version}**\n\n` +
                                    'Platform: **NodeJS**\n\n' +
                                    `Audio encoding library: **Tweetnacl** *(https://www.npmjs.com/package/tweetnacl)*\n\n` +
                                    'Audio playback tool: **FFmpeg-static** *(https://www.npmjs.com/package/ffmpeg-static)*',

            footer: 'ℹ️ Settings are constant and cannot be changed by users'
        },
        help_embed: {
            title: ':bookmark: Documentation',
            
            creating_name: ':hammer_pick: Creation and management',
            playing_name_1: ':headphones: Playing **(1)**',
            playing_name_2: ':headphones: Playing **(2)**',

            creating_value: '**makew** [*<quality>*] [*<url>*] - Creating a WAV file from a Youtube video (*quality: normal / best*)\n\n' +
                                '**libw** [*<show/inx>*] - Output a WAV audio library (*specified "show"*) or upload to the cloud a file under the specified index (*specified number*)',
            playing_value_1: '**playw (plw)** [*<url/inx/all/all_random/query>*] - Playback of audio files: from WAV audio library (*specified number*), from Youtube (*specified link*), all WAV in order (*specified "all"*), all WAV in random order (*specified "all_random"*), by keywords (*specified word set*)\n\n' +
                                '**pausew (paw)** - Pause playback\n\n' +
                                '**resumew (rew)** - Resume playback\n\n' +
                                '**skipw (skw)** - Skipping the currently playing track\n\n' +
                                '**stopw (stw)** - Stopping playback and completely clearing the queue\n\n' +
                                '**loopw (low)** - Track currently playing loops (can be disabled by entering the command again)\n\n' +
                                '**audinfw (auw)** - Playback information\n\n' + 
                                '**queuew (quw)** - Show the queue\n\n' +
                                '**deletew (dew)** [*<last/num>*] [*n*] - Deleting *n* last audio tracks from the queue (specifying *last* and *number*) or deleting one specific track (specifying *num* and *number*)',
            playing_value_2: '**findw (fiw)** [*<query>*] - Searching for audio in the WAV audio library and on Youtube\n\n' + 
                                '**choosew (chw)** [*<inx>*] - Adding a track to the queue with the specified number from the database of found audio recordings (available only after calling *findw*)',
        },
        audinf_embed: {
            title: ':headphones:  Audio player',

            loop_name: ':arrows_counterclockwise:  Loop',
            loop_enabled_value: 'Status: **Enabled**',
            loop_disabled_value: 'Status: **Disabled**',

            playing_name: ':eight_spoked_asterisk:  Playing',
            paused_name: ':pause_button:  Paused',
            audio_value: 'Audio: **[track_title]**',
            
            track_adress_name: ':mailbox:  Track adress',
            track_adress_value: 'Resource: **[track_adress]**'
        },
        queue_embed: {
            title: ':card_box:  Playback queue',
            name: 'ℹ️ List of tracks in the queue (p. [embed_inx]):'
        },
        find_embed: {
            title: ':mag_right:  Music search',

            wavlib_name: ':card_box: **WAV audio library**',
            youtube_name: ':globe_with_meridians:  **Youtube**',

            footer: 'ℹ️ Use >choosew (chw) [n] to select the track number to be added to the queue'
        }
    },

    CheckEquivalence() {
        let [example_locale_mess_count, example_locale_mess_texts] = [0, []];
        let [current_locale_mess_count, current_locale_mess_texts] = [0, []];
        
        for (locale in this) {
            if (typeof this[locale] != 'object') continue;
            
            current_locale_mess_count = 0;
            current_locale_mess_texts = [];
            
            for (mess in this[locale]) {
                current_locale_mess_count += 1;
                current_locale_mess_texts.push(mess);
            }

            if (example_locale_mess_count == 0) {
                example_locale_mess_count = current_locale_mess_count;
                example_locale_mess_texts = current_locale_mess_texts
            }
            else if (current_locale_mess_count != example_locale_mess_count || !example_locale_mess_texts.every(function(element, index) { return element === current_locale_mess_texts[index]; })) return false;
        }
        return true;
    }
}