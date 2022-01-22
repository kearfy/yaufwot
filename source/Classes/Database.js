import { MongoClient } from 'mongodb';
import chalk from 'chalk';

export class Database {
    static client = null;
    static async initialize() {
        if (!this.client) {
            this.client = await new Promise((resolve, reject) => {
                let url = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}`;
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;        
                    console.log(`${chalk.yellow('[MONG]')} Connected!`); 
                    resolve(db);
                });
            });
        }
    }

    static db(database = null) {
        if (!this.client) return false;
        if (!database) database = process.env.MONGO_DATABASE;
        return this.client.db(database);
    }

    static collection(collection) {
        if (!this.client) return false;
        return this.db().collection(collection);
    }
}