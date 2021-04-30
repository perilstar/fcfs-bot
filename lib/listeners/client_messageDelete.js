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
const discord_js_1 = require("discord.js");
class MessageDeleteListener extends discord_akairo_1.Listener {
    constructor() {
        super('messageDelete', {
            emitter: 'client',
            event: 'messageDelete',
        });
    }
    exec(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const { channel } = message;
            if (!(channel instanceof discord_js_1.TextChannel))
                return;
            const ds = client.dataSource;
            const server = ds.servers[channel.guild.id];
            Object.keys(server.channelMonitors).forEach((snowflake) => {
                if (server.channelMonitors[snowflake].displayMessage === message.id) {
                    ds.removeMonitor(server.id, snowflake);
                }
            });
        });
    }
}
exports.default = MessageDeleteListener;
