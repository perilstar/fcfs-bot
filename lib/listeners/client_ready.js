"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReadyListener extends discord_akairo_1.Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
        });
    }
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            console.log('Getting client ready');
            yield client.user.setActivity(`fcfs!help | v${client.version}`);
            setInterval(() => client.user.setActivity(`fcfs!help | v${client.version}`), 60000);
            console.log('Client is ready!');
            if (client.ready)
                return;
            yield client.dataSource.revUpThoseFryers();
            client.commandHandler.loadAll();
            client.commandHandler.useListenerHandler(client.listenerHandler);
            client.listenerHandler.loadAll(client.listenerHandler.directory, (path) => !path.includes('client_ready'));
            client.ready = true;
        });
    }
}
exports.default = ReadyListener;
