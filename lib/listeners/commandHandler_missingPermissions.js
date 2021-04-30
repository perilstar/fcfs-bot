"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class MissingPermissionsListener extends discord_akairo_1.Listener {
    constructor() {
        super('missingPermissions', {
            emitter: 'commandHandler',
            event: 'missingPermissions',
        });
    }
    exec(message, _command, type, missing) {
        if (missing === 'botAdmin') {
            sendmessage_1.default(message.channel, 'Missing permissions to do this! Are you a bot admin?');
            return;
        }
        if (missing === 'botMod') {
            sendmessage_1.default(message.channel, 'Missing permissions to do this! Are you a bot mod or higher?');
            return;
        }
        if (missing === 'botHelper') {
            sendmessage_1.default(message.channel, 'Missing permissions to do this! Are you a bot helper or higher?');
            return;
        }
        if (type === 'user') {
            sendmessage_1.default(message.channel, 'Missing permissions to do this! Are you an Administrator?');
            return;
        }
        if (type === 'unknown') {
            sendmessage_1.default(message.channel, 'An unknown error occurred sorting out permissions for this command!');
        }
    }
}
exports.default = MissingPermissionsListener;
