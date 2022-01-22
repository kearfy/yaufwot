import fs from 'fs';
import path from 'path';
import { Database } from './Database.js';

const defaultGuildProperties = JSON.parse(fs.readFileSync(path.dirname('') + '/defaultGuildProperties.json'));
const toBeCached = ['prefix'];

class CachedConfig {
    static guilds = {};
}

export default class GuildConfig {
    guildId = null;

    constructor(guildId) {
        this.guildId = guildId;
        if (!CachedConfig.guilds[guildId]) CachedConfig.guilds[guildId] = {};
    }

    async get(property) {
        const guildId = this.guildId;
        property = property.toLowerCase();
        if (CachedConfig.guilds[guildId][property]) {
            return CachedConfig.guilds[guildId][property];
        } else {
            const col = Database.collection('guilds');
            return new Promise(resolve => {
                col.findOne({
                    'id': guildId
                }, function(err, item) {
                    if (!item) {
                        col.insertOne(Object.assign({}, defaultGuildProperties, {
                            id: guildId
                        }));

                        if (toBeCached.includes(property)) CachedConfig.guilds[guildId][property] = this.properties[property];
                        resolve(this.properties[property]);
                    } else {
                        if (toBeCached.includes(property)) CachedConfig.guilds[guildId][property] = item[property];
                        resolve(item[property]);
                    }
                });
            });
        }
    }

    async set(property, value) {
        const guildId = this.guildId;
        property = property.toLowerCase();
        if (toBeCached.includes(property)) CachedConfig.guilds[guildId][property] = value;
        const col = Database.collection('guilds');
        return new Promise(resolve => {
            col.findOne({
                'id': guildId
            }, function(err, item) {
                if (!item) {
                    var props = {id: guildId};
                    props[property] = value;
                    col.insertOne(Object.assign({}, defaultGuildProperties, props));
                    resolve(true);
                } else {
                    var update = {};
                    update[property] = value;
                    col.updateOne({
                        'id': guildId
                    }, {$set:update}, function(err, result) {
                        resolve(true);
                    });
                }
            });
        });
    }
}