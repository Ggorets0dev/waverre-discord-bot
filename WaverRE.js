const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
const Discord = require('discord.js');
const ExFunc = require('./ExtraFunctions.js');

const config = require('./WREconfig.json');
const package = require('./package.json');
require('dotenv').config();


// TODO: Create opportunity to change bot language in config
// TODO: GitHub deploy (after RantoVox finally deploy)


figlet.text('Waver . RE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
}, (err, data) => {
    if (err) return ExFunc.Logger("error", 'An error occurred during the drawing of the logo by figlet module', path.basename(__filename));
    console.log('\n\n' + data);
});


// * Cleaning old files if they exist
ExFunc.StartupPreparing();


const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Discord.Collection();

const command_files = fs.readdirSync(path.join(__dirname, "commands"));
for (const cmd of command_files){
    const command = require(path.join(__dirname, "commands", cmd));
    client.commands.set(command.name, command);
}


client.on('ready', () => {
    ExFunc.Logger("success", `Successfully started up and logged on (version: ${package.version})`, path.basename(__filename));
    client.user.setPresence({ activities: [{ name: `${config.prefix}helpw | ${config.prefix}aboutw` }] });
});


client.on('messageCreate', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const req = args.shift().toLowerCase();

    const command = client.commands.get(req) || client.commands.find(a => a.aliases && a.aliases.includes(req))
    if (command) command.execute(message, req, args, config, ExFunc, Discord);
});


client.login(process.env.DISCORD_TOKEN);