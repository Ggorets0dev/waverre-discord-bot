const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
const Discord = require('discord.js');

const config = require('./config.json');
const package = require('./package.json');
const exfunc = require('./tech/extra_functions.js');


var [localization, locale] = [null, null]; // * Will be loaded during the initial startup
require('dotenv').config();


figlet.text('Waver . RE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
}, (err, data) => {
    if (err) return exfunc.Logger('error', 'An error occurred during startup preparing', path.basename(__filename));
    
    // * Cleaning old files if they exist
    exfunc.FileStartupPreparing();

    console.log(`\n\n${data}`);
    console.log(` Developed by Ggorets0dev, original GitHub page: https://github.com/Ggorets0dev/Waver.RE-Bot (version: ${package.version})\n`)

    // * Initiating localization
    localization = require('./tech/localization.js');
    if (localization[config.language]) {
        locale = localization[config.language];
        exfunc.Logger('success', `Interface language successfully connected: ${config.language}`, path.basename(__filename));
    }
    else {
        locale = localization['ENG'];
        exfunc.Logger('warning', 'Failed to connect locale from configuration file, default locale will be selected: ENG', path.basename(__filename));
    }
    
    if (!localization.CheckEquivalence()) exfunc.Logger('error', 'Inequality of properties was found in the available locations', path.basename(__filename));
});


const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Discord.Collection();

const command_files = fs.readdirSync(path.join(__dirname, 'commands'));
for (const cmd of command_files){
    const command = require(path.join(__dirname, 'commands', cmd));
    client.commands.set(command.name, command);
}


client.on('ready', () => {
    exfunc.Logger('success', 'Successfully logged in Discord', path.basename(__filename));
    client.user.setPresence( { activities: [{ name: `${config.prefix}helpw | ${config.prefix}aboutw` }] } );
});


client.on('messageCreate', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const req = args.shift().toLowerCase();

    const command = client.commands.get(req) || client.commands.find(a => a.aliases && a.aliases.includes(req))
    if (command) {
        if (!locale) locale = localization['ENG'];
        command.execute(message, req, args, config, exfunc, locale, Discord);
    }
});


client.login(process.env.DISCORD_TOKEN);