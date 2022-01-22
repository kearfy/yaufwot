import { SlashCommand } from '../Classes/Command.js';

export default class Help extends SlashCommand {
    constructor() {
        super({
            name: "help",
            description: "Shows a list of commands and utilities."
        }, async interaction => {
            interaction.reply({
                content: "Sorry! The /help command is not ready yet.",
                ephemeral: true
            });
        });
    }
}