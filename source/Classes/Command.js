import glob from 'glob';
import chalk from 'chalk';
import GuildConfig from './GuildConfig.js';

class CommandStorage {
    static commands = {};
    static slashCommands = {};
    static guildCommands = {};
    static slashGuildCommands = {};
    static client = null;
}

export class CommandWorker {
    static initialize(client) {
        if (!CommandStorage.client) {
            CommandStorage.client = client;

            client.on('interactionCreate', async interaction => {
                if (!interaction.isCommand()) return;
                if (CommandStorage.slashGuildCommands[interaction.guildId] && CommandStorage.slashGuildCommands[interaction.guildId][interaction.commandName.toLowerCase()]) {
                    await CommandStorage.slashGuildCommands[interaction.guildId][interaction.commandName.toLowerCase()].handler(interaction);
                } else if (CommandStorage.slashCommands[interaction.commandName.toLowerCase()]) {
                    await CommandStorage.slashCommands[interaction.commandName.toLowerCase()].handler(interaction);
                } else {
                    await interaction.reply("**An unexpected error occured:** This SlashCommand is not registered anymore!");
                }
            });

            client.on('message', async message => {
                const parsed = await this.parseMessage(message);
                if (parsed.command) {
                    if (CommandStorage.guildCommands[message.guildId] && CommandStorage.guildCommands[message.guildId][parsed.command.toLowerCase()]) {
                        await CommandStorage.guildCommands[message.guildId][parsed.command.toLowerCase()].handler(parsed, message);
                    } else if (CommandStorage.commands[parsed.command.toLowerCase()]) {
                        await CommandStorage.commands[parsed.command.toLowerCase()].handler(parsed, message);
                    } else {
                        await message.reply("**An unexpected error occured:** This Command is not registered anymore!");
                    }
                }
            });
        }
    }

    static async loadCommands() {
        console.log(`${chalk.blue('[CMND]')} Loading Commands.`);
        return new Promise((resolve, reject) => glob(process.cwd() + '/source/Commands/*.js', {}, async (err, files) => {
            if (err) return reject(err);
            for(var i = 0; i < files.length; i++) {
                console.log(`${chalk.blue('[CMND]')} Loading command ${chalk.green('"' + files[i].replace(/^.*[\\\/]/, '').split('.')[0] + '"')}.`);
                const { default: Command } = await import(files[i]);
                new Command();
            }

            resolve(true);
        }));
    }

    static async loadSlashCommands() {
        console.log(`${chalk.blue('[CMND]')} Loading Slash Commands.`);
        return new Promise((resolve, reject) => glob(process.cwd() + '/source/SlashCommands/*.js', {}, async (err, files) => {
            if (err) return reject(err);
            for(var i = 0; i < files.length; i++) {
                console.log(`${chalk.blue('[CMND]')} Loading slash command ${chalk.green('"/' + files[i].replace(/^.*[\\\/]/, '').split('.')[0] + '"')}.`);
                const { default: Command } = await import(files[i]);
                new Command();
            }

            resolve(true);
        }));
    }

    static async listCommands(guildId = null) {
        var result = {};
        if (guildId) {
            if (CommandStorage.guildCommands[guildId]) Object.values(CommandStorage.guildCommands[message.guildId]).forEach(cmd => {
                result[cmd.command.name.toLowerCase()] = cmd.command;
            });
        } else {
            Object.values(CommandStorage.commands).forEach(cmd => {
                result[cmd.command.name.toLowerCase()] = cmd.command;
            });
        }

        return result;
    }

    static async listSlashCommands(guildId = null) {
        var result = {};
        if (guildId) {
            if (CommandStorage.guildSlashCommands[guildId]) Object.values(CommandStorage.guildSlashCommands[message.guildId]).forEach(cmd => {
                result[cmd.command.name.toLowerCase()] = cmd.command;
            });
        } else {
            Object.values(CommandStorage.slashCommands).forEach(cmd => {
                result[cmd.command.name.toLowerCase()] = cmd.command;
            });
        }

        return result;
    }

    static async parseMessage(message) {
        var result = {
            command: null,
            subcommand: null,
            arguments: {}
        };

        let gconf = new GuildConfig((message.guildId ? message.guildId : 0));
        let prefix = await gconf.get('prefix');
        if (message.content.substring(0, prefix.length) == prefix && !message.author.bot) {
            let prefixRemoved = message.content.substring(prefix.length);
            let split = prefixRemoved.split(' ');
            var lastArg = null;
            
            split.forEach(part => {
                if (!result.command) {
                    result.command = part.toLowerCase();
                } else {
                    if (part.substring(0, 2) == '--') {
                        lastArg = part.substring(2);
                        result.arguments[lastArg] = ''
                    } else if (part.substring(0, 1) == '-') {
                        lastArg = part.substring(1);
                        result.arguments[lastArg] = ''
                    } else {
                        if (lastArg) {
                            result.arguments[lastArg] += (result.arguments[lastArg].length == 0 ? part : ' ' + part);
                        } else {
                            if (!result.subcommand) result.subcommand = '';
                            result.subcommand += (result.subcommand.length == 0 ? part : ' ' + part);
                        }
                    }
                }
            });
        }

        return result;
    }
}

export class SlashCommand {
    constructor(options, handler, guildId = null) {
        if (!CommandStorage.client) {
            throw new Error(chalk.red("A slash command was registered before the command worker was initialized!"));
        } else {
            if (guildId) {
                var guild = CommandStorage.client.guilds.cache.get(guildId);
                if (guild) {
                    if (!CommandStorage.slashGuildCommands[guildId]) CommandStorage.slashGuildCommands[guildId] = {};
                    if (CommandStorage.slashGuildCommands[guildId][options.name.toLowerCase()]) {
                        console.error(`Slash command ${chalk.blue(options.name)} already exists for guild with ID ${chalk.blue(guildId)}.`);
                    } else {
                        CommandStorage.slashGuildCommands[guildId][options.name.toLowerCase()] = {
                            class: this,
                            handler: handler,
                            command: guild.commands.create(options)
                        };
                    }
                } else {
                    console.error(`A guild with id ${chalk.blue(guildId)} does not exist.`);
                }
            } else {
                if (CommandStorage.slashCommands[options.name.toLowerCase()]) {
                    console.error(`Slash command ${chalk.blue(options.name)} already exists globally.`);
                } else {
                    CommandStorage.slashCommands[options.name.toLowerCase()] = {
                        class: this,
                        handler: handler,
                        command: CommandStorage.client.application.commands.create(options)
                    };
                }
            }
        }
    }

    client() {
        return CommandStorage.client;
    }
}

export class Command {
    constructor(options, handler, guildId = null) {
        if (!CommandStorage.client) {
            throw new Error(chalk.red("A command was registered before the command worker was initialized!"));
        } else {
            if (guildId) {
                var guild = CommandStorage.client.guilds.cache.get(guildId);
                if (guild) {
                    if (!CommandStorage.guildCommands[guildId]) CommandStorage.guildCommands[guildId] = {};
                    if (CommandStorage.guildCommands[guildId][options.name.toLowerCase()]) {
                        console.error(`Command ${chalk.blue(options.name)} already exists for guild with ID ${chalk.blue(guildId)}.`);
                    } else {
                        CommandStorage.guildCommands[guildId][options.name.toLowerCase()] = {
                            class: this,
                            handler: handler,
                            command: options
                        };
                    }
                } else {
                    console.error(`A guild with id ${chalk.blue(guildId)} does not exist.`);
                }
            } else {
                if (CommandStorage.commands[options.name.toLowerCase()]) {
                    console.error(`Slash command ${chalk.blue(options.name)} already exists globally.`);
                } else {
                    CommandStorage.commands[options.name.toLowerCase()] = {
                        class: this,
                        handler: handler,
                        command: options
                    };
                }
            }
        }
    } 

    client() {
        return CommandStorage.client;
    }
}