import { CommandWorker, Command } from '../Classes/Command.js';
import GuildConfig from '../Classes/GuildConfig.js';
import Discord from 'discord.js';

const categories = {
    "utilities": {
        "name": "⚙️ Utilities",
        "commands": []
    },
    "others": {
        "name": "❓ Others",
        "commands": []
    }
}

export default class Help extends Command {
    constructor() {
        super({
            name: "Help",
            emoji: "📙",
            description: "Obtain a list of commands.",
            usage: "[command]",
            category: "utilities"
        }, async (parsed, message) => {
            await message.channel.sendTyping();
            var gconf = new GuildConfig((message.guildId ? message.guildId : 0));
            var prefix = await gconf.get('prefix');
            var commands = await CommandWorker.listCommands();
            if (message.guildId) {
                commands = Object.assign({}, commands, await CommandWorker.listCommands(message.guildId));
            }

            if (parsed.subcommand) {
                if (commands[parsed.subcommand.toLowerCase()]) {
                    var cmd = commands[parsed.subcommand.toLowerCase()];

                    var embed = new Discord.MessageEmbed({
                        title: (cmd.emoji ? cmd.emoji + " " : "") + cmd.name + " command",
                        description: cmd.description,
                        fields: [
                            {
                                name: "Usage",
                                value: '`' + prefix + cmd.name.toLowerCase() + (cmd.usage ? ' ' + cmd.usage : '') + '`'
                            }
                        ]
                    });
    
                } else {
                    var embed = new Discord.MessageEmbed({
                        title: "❌ Unknown command",
                        description: "That command does not exist! Try `" + prefix + "help` to obtain a list of commands."
                    });
                }
            } else {
                var fields = {...categories};
                Object.keys(fields).forEach(field => fields[field].commands = []);
                Object.values(commands).forEach(cmd => {
                    fields[(fields[cmd.category] ? cmd.category : 'others')].commands.push(cmd.name.toLowerCase());
                });

                Object.keys(fields).forEach(field => {
                    if (fields[field].commands.length == 0) {
                        delete fields[field];
                    } else {
                        fields[field].commands = fields[field].commands.map(cmd => '`' + cmd + '`');
                    }
                });

                fields = Object.values(fields).map(cat => ({
                    name: cat.name,
                    value: cat.commands.join(' ')
                }));

                var embed = new Discord.MessageEmbed({
                    title: "📙 Command overview",
                    description: "Use `" + prefix + 'help [command]` to get more details.\nUse each command with `' + prefix + '` in front of it!',
                    fields: fields
                });

            }

            embed.setColor('#586aea');
            embed.setFooter("Requested by @" + message.author.tag + " • Provided by @" + this.client().user.tag);
            embed.setThumbnail(this.client().user.avatarURL({dynamic: true}));
            message.channel.send({embeds: [embed]});
        });
    }
}