import Discord from 'discord.js';

export class Client extends Discord.Client {
    constructor(options = {}) {
        options = Object.assign({
            intents: [
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
            ]
        }, options);

        super(options);
    } 
}