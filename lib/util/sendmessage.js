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
const discord_js_1 = require("discord.js");
function sendmessage(channel, text) {
    return __awaiter(this, void 0, void 0, function* () {
        if (channel.deleted)
            return console.error('Failed to send message in deleted channel!');
        const cleanContent = discord_js_1.Util.removeMentions(text);
        return channel.send(cleanContent)
            .catch((err) => {
            if (err.message === 'Missing Permissions') {
                if (channel.type === 'text') {
                    console.error(`Failed to send message in #${channel.name} (ID #${channel.id}) due to Missing Permissions!`);
                }
                else {
                    console.error(`Failed to send message in a DM (ID #${channel.id}) due to Missing Permissions!`);
                }
                return null;
            }
            console.log(`Error trying to send a message!\n${err.message}`);
            throw (err);
        });
    });
}
exports.default = sendmessage;
