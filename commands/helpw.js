module.exports = {
    name: 'helpw',
    description: 'Documentation',
    async execute(message, cmd, args, config, exfunc, Discord){
        const helpw_making =    "**makew** [*<quality>*] [*<url>*] - Создание файла WAV из ролика Youtube (*quality: normal / best*)\n\n" +
                                "**libw** [*<show/inx>*] - Вывод аудиотеки WAV (*указывается show*) или загрузка на облако файла под указанным индексом (*указывается номер*)";
        
        const helpw_playing1 =  "**playw (plw)** [*<url/inx/all/all_random/query>*] - Проигрывание аудиофайлов: из аудиотеки WAV (*указывается номер*), из Youtube (*указывается ссылка*), всех WAV по порядку (*указывается all*), всех WAV в случайном порядке (*указывается all_random*), по ключевым словам (*указывается набор слов*)\n\n" +
                                "**pausew (paw)** - Приостановка проигрования\n\n" +
                                "**resumew (rew)** - Возобновление проигрывания\n\n" +
                                "**skipw (skw)** - Пропуск играющего в данный момент трека\n\n" +
                                "**stopw (stw)** - Остановка проигрывания и полная очистка очереди\n\n" +
                                "**loopw (low)** - Зацикливание играющего в данный момент трека (отключается повторным вводом команды)\n\n" +
                                "**audinfw (auw)** - Информация о проигрывании\n\n" + 
                                "**queuew (quw)** - Просмотр очереди\n\n" +
                                "**deletew (dew)** [*<last/num>*] [*n*] - Удаление из очереди *n* последних аудиозаписей (указывается *last* и *кол-во*) или удаление одного определенного трека (указывается *num* и *номер*)";

        const helpw_playing2 =  "**findw (fiw)** [*<query>*] - Поиск аудиозаписи в аудиотеке WAV и на Youtube\n\n" + 
                                "**choosew (chw)** [*<inx>*] - Добавление в очередь трека под указанным номером из базы найденных аудиозаписей (доступно только после вызова *findw*)";

        const helpw_embed = new Discord.MessageEmbed()
        .setColor(config.embed_color_hex)
        .setTitle(':bookmark:  Документация')
        .addFields(
            { name: ':hammer_pick: Создание и управление', value: helpw_making },
            { name: ':headphones: Проигрывание **(1)**', value: helpw_playing1 },
            { name: ':headphones: Проигрывание **(2)**', value: helpw_playing2 }
        )
        .setFooter({text: 'Dev: Ggorets0\nLogo: Kom12007'});
        message.channel.send({embeds: [helpw_embed]});
    }
}