import { Command } from '../Classes/Command.js';
import GuildConfig from '../Classes/GuildConfig.js';
import Discord from 'discord.js';

const configOptions = {
    value: [
        "prefix"
    ],
    bool: [
        "test"
    ]
}

export default class Ping extends Command {
    constructor() {
        super({
            name: "Config",
            emoji: "⚙️",
            description: "Configuration of the bot in this server.",
            category: "utilities",
            usage: "[action] [key] [value]"
        }, async (parsed, message) => {
            await message.channel.sendTyping();
            var gconf = new GuildConfig((message.guildId ? message.guildId : 0));
            var prefix = await gconf.get('prefix');

            if (!message.member.permissionsIn(message.channel).has('ADMINISTRATOR')) {
                var embed = new Discord.MessageEmbed({
                    title: "❌ No permission",
                    description: "Only administrators can view and alter the bot's configuration."
                });
            } else if (!parsed.subcommand) {
                var embed = new Discord.MessageEmbed({
                    title: "📙 Config command",
                    description: "Use this command like `" + prefix + 'config [action] [option] [value]`.\nThe actions are listed below.',
                    fields: [

                        // ACTION: GET
                        {
                            name: "Action",
                            value: "get",
                            inline: true
                        },
                        {
                            name: "Description",
                            value: "Get a config option value.",
                            inline: true
                        },
                        {
                            name: "Usage",
                            value: "`" + prefix + "config get [option]`",
                            inline: true
                        },

                        //ACTION: SET
                        {
                            name: "Action",
                            value: "set",
                            inline: true
                        },
                        {
                            name: "Description",
                            value: "Set a config option value.",
                            inline: true
                        },
                        {
                            name: "Usage",
                            value: "`" + prefix + "config set [option] [value]`",
                            inline: true
                        },

                        //ACTION: TOGGLE
                        {
                            name: "Action",
                            value: "toggle",
                            inline: true
                        },
                        {
                            name: "Description",
                            value: "Toggle a config option.",
                            inline: true
                        },
                        {
                            name: "Usage",
                            value: "`" + prefix + "config toggle [option]`",
                            inline: true
                        },

                        //ACTION: OPTIONS
                        {
                            name: "Action",
                            value: "options",
                            inline: true
                        },
                        {
                            name: "Description",
                            value: "List all config options.",
                            inline: true
                        },
                        {
                            name: "Usage",
                            value: "`" + prefix + "config options`",
                            inline: true
                        }
                    ]
                });
            } else {
                const split = parsed.subcommand.split(' ');
                switch(split[0]) {
                    case 'get':
                        if (split[1]) {
                            const value = await gconf.get(split[1]);
                            if (value) { 
                                var embed = new Discord.MessageEmbed({
                                    title: "⚙️ Option " + split[1].toLowerCase(),
                                    description: "Here you go!",
                                    fields: [
                                        {
                                            name: "Value",
                                            value: "`" + value + "`"
                                        }
                                    ]
                                });
                            } else {
                                var embed = new Discord.MessageEmbed({
                                    title: "❌ Unknown option",
                                    description: "Check available options with `" + prefix + "config options`."
                                });
                            }
                        } else {
                            var embed = new Discord.MessageEmbed({
                                title: "❌ Missing option",
                                description: "Correct usage: `" + prefix + "config get [option]`."
                            });
                        }
                        break;
                    case 'set':

                        break;
                    case 'toggle':

                        break;
                    case 'options':

                        break;
                    default:
                        var embed = new Discord.MessageEmbed({
                            title: "❌ Unknown action",
                            description: "The requested action does not exist."
                        });

                        break;
                }
            }

            embed.setColor('#586aea');
            embed.setFooter("Requested by @" + message.author.tag + " • Provided by @" + this.client().user.tag);
            embed.setThumbnail(this.client().user.avatarURL({dynamic: true}));
            message.channel.send({embeds: [embed]});
        });
    }
}