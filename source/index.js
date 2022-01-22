import chalk from 'chalk';

console.log(`${chalk.red('[MAIN]')} Preparing environment.`);
import dotenv from 'dotenv';
dotenv.config();

console.log(`${chalk.red('[MAIN]')} Importing Classes.`);
import { Client } from './Classes/Client.js';
import { PluginWorker } from './Classes/Plugin.js';
import { CommandWorker } from './Classes/Command.js';
import { Database } from './Classes/Database.js';

(async function() {
    console.log(`${chalk.red('[MAIN]')} Starting bot.`); 
    var bot = new Client();

    console.log(`${chalk.yellow('[MONG]')} Connecting to the database.`);
    await Database.initialize();

    console.log(`${chalk.red('[MAIN]')} Loading the plugin worker.`);
    PluginWorker.initialize(bot);
    PluginWorker.intercept();

    console.log(`${chalk.red('[MAIN]')} Loading the command worker.`);
    CommandWorker.initialize(bot);

    bot.once('ready', async () => {
        await PluginWorker.loadPlugins();
        await CommandWorker.loadCommands();
        await CommandWorker.loadSlashCommands();
    });

    console.log(`${chalk.red('[MAIN]')} Logging into the Discord API.`);
    bot.login(process.env.BOT_TOKEN);
})();