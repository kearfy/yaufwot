import { SlashCommand } from '../Classes/Command.js';

export default class Ping extends SlashCommand {
    constructor() {
        super({
            name: "ping",
            description: "⚡ Calculates ping time to the server."
        }, async interaction => {
            interaction.deferReply().then(() => {
                interaction.editReply(`:ping_pong:  **Pong!** \n:zap:  Latency is **${Date.now() - interaction.createdTimestamp}ms**, API Latency is **${Math.round(this.client().ws.ping)}ms**.`);
            });
        });
    }
}