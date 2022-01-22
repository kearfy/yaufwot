import glob from 'glob';
import chalk from 'chalk';

class PluginStorage {
    static plugins = {};
    static eventRegistrations = {};
    static client = null;

    static gatherListeners(event) {
        if (this.eventRegistrations[event]) {
            return this.eventRegistrations[event].map(plugin => Object.assign({}, plugin, {
                plugin: this.plugins[plugin.plugin]
            }));
        } else {
            return [];
        }
    }
}

export class PluginWorker {
    static initialize(client) {
        PluginStorage.client = client;
    }

    static intercept() {
        if (!PluginStorage.client) return false;
        var oldEmit = PluginStorage.client.emit;
        PluginStorage.client.emit = function() {
            oldEmit.apply(PluginStorage.client, arguments);
            PluginWorker.triggerEvent.apply(null, arguments);
        }

        return true;
    }

    static triggerEvent() {
        const plugins = PluginStorage.gatherListeners(arguments[0]);
        plugins.forEach(plugin => plugin.handler.apply(plugin.plugin, Array.from(arguments).slice(1)));
    }

    static async loadPlugins() {
        console.log(`${chalk.blue('[PLUG]')} Loading plugins.`);
        return new Promise((resolve, reject) => glob(process.cwd() + '/source/Plugins/*.js', {}, async (err, files) => {
            if (err) return reject(err);
            for(var i = 0; i < files.length; i++) {
                console.log(`${chalk.blue('[PLUG]')} Loading plugin ${chalk.green('"' + files[i].replace(/^.*[\\\/]/, '').split('.')[0] + '"')}.`);
                const { default: Plugin } = await import(files[i]);
                new Plugin();
            }

            resolve(true);
        }));
    }
}

export class Plugin {
    constructor(name) {
        this.name = name;
        PluginStorage.plugins[name] = this;
    }

    listen(event, handler) {
        if (!PluginStorage.eventRegistrations[event]) PluginStorage.eventRegistrations[event] = [];
        PluginStorage.eventRegistrations[event].push({plugin: this.name, handler: handler});
    }
}