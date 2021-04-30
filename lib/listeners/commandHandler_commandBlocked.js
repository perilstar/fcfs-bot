"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class CommandBlockedListener extends discord_akairo_1.Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            event: 'commandBlocked',
        });
    }
    exec(message, command, reason) {
        if (reason === 'guild') {
            sendmessage_1.default(message.channel, 'You can only use this command in a guild!');
        }
    }
}
exports.default = CommandBlockedListener;
