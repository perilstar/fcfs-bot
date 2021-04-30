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
class ChannelDeleteListener extends discord_akairo_1.Listener {
    constructor() {
        super('channelDelete', {
            emitter: 'client',
            event: 'channelDelete',
        });
    }
    static removeMessage(channelMonitor, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const displayChannel = client.channels.resolve(channelMonitor.displayChannel);
                displayChannel.messages.delete(channelMonitor.displayMessage);
            }
            catch (err) {
            }
        });
    }
    exec(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            if (!(channel instanceof discord_js_1.GuildChannel))
                return;
            const ds = client.dataSource;
            const server = ds.servers[channel.guild.id];
            if (channel.type === 'voice') {
                if (server.channelMonitors[channel.id]) {
                    ChannelDeleteListener.removeMessage(server.channelMonitors[channel.id], client);
                    ds.removeMonitor(server.id, channel.id);
                }
            }
            if (channel.type === 'text') {
                Object.keys(server.channelMonitors).forEach((snowflake) => {
                    if (server.channelMonitors[snowflake].displayChannel === channel.id) {
                        ds.removeMonitor(server.id, snowflake);
                    }
                });
            }
        });
    }
}
module.exports = ChannelDeleteListener;
