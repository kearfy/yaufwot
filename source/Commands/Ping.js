import { Command } from '../Classes/Command.js';

export default class Ping extends Command {
    constructor() {
        super({
            name: "Ping",
            emoji: "⚡",
            description: "Calculates ping time to the server.",
            category: "utilities"
        }, async (parsed, message) => {
            await message.channel.sendTyping();
            await message.reply(`:ping_pong:  **Pong!** \n:zap:  Latency is **${Date.now() - message.createdTimestamp}ms**, API Latency is **${Math.round(this.client().ws.ping)}ms**.`);
        });
    }
}