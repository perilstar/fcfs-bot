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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const discord_js_1 = require("discord.js");
const constants_1 = __importDefault(require("../util/constants"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class HelpCommand extends discord_akairo_1.Command {
    constructor() {
        super('help', {
            aliases: ['help', 'about', 'commands'],
            args: [
                {
                    id: 'page',
                    type: 'uppercase',
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const pages = constants_1.default.HelpPages;
            const page = args.page ? args.page : 'DEFAULT';
            if (!pages[page]) {
                sendmessage_1.default(message.channel, 'Unknown page!');
                return;
            }
            let content = `**First Come, First Serve**\n*Default prefix:* \`fcfs!\`\n\n${pages[page].trim().split('\n').map((line) => line.trim()).join('\n')}`;
            if (page === 'DEFAULT') {
                content += `\n\n\`v${this.client.version} by perilstar with help from StKWarrior\``;
            }
            let { dmChannel } = message.author;
            if (!dmChannel) {
                dmChannel = yield message.author.createDM();
            }
            if (message.channel instanceof discord_js_1.TextChannel) {
                sendmessage_1.default(message.channel, 'Sending you a DM with the help message!');
            }
            sendmessage_1.default(dmChannel, content);
        });
    }
}
exports.default = HelpCommand;
