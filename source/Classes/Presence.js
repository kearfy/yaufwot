import chalk from 'chalk';

class PresenceStorage {
    static client = null;
    static current = {};
}

export class Presence {
    static initialize(client, presence = null) {
        PresenceStorage.client = client;
    }

    static set(presence) {
        if (!PresenceStorage.client) return false;
        PresenceStorage.client.user.setPresence({
            activity: presence
        });
    }
}