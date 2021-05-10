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
const afk_checker_1 = __importDefault(require("../struct/afk_checker"));
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const mps_mod_1 = __importDefault(require("../util/mps_mod"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class AfkCheckTopCommand extends discord_akairo_1.Command {
    constructor() {
        super('afkchecktop', {
            aliases: ['afkchecktop'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_mod_1.default(this.client, message),
            args: [
                {
                    id: 'monitorChannel',
                    type: 'monitorChannel',
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'monitorChannel', failure),
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const server = ds.servers[message.guild.id];
            const channelMonitor = args.monitorChannel;
            if (!channelMonitor.queue.length) {
                sendmessage_1.default(message.channel, `Error: there are no members in queue in ${args.monitorChannel.name}`);
                return;
            }
            const update = (m, data) => {
                let text = `Mass AFK-checking for ${channelMonitor.name}...\n\n`;
                if (data.recentlyChecked)
                    text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
                if (data.notInVC)
                    text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
                if (data.notAFK)
                    text += `${data.notAFK} member(s) reacted to the message in time\n`;
                if (data.afk)
                    text += `${data.afk} member(s) were booted from the queue\n`;
                m.edit(text).catch((err) => console.log(`Failed to update in mass check!\n${err.message}`));
            };
            const finalize = (m, data) => {
                let text = `Mass AFK-checking complete for ${channelMonitor.name}!\n\n`;
                if (data.recentlyChecked) {
                    text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over:\n`;
                    text += data.recentlyCheckedList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
                    text += '\n';
                }
                if (data.notInVC) {
                    text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over:\n`;
                    text += data.notInVCList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
                    text += '\n';
                }
                if (data.notAFK) {
                    text += `${data.notAFK} member(s) reacted to the message in time:\n`;
                    text += data.notAFKList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
                    text += '\n';
                }
                if (data.afk) {
                    text += `${data.afk} member(s) were booted from the queue\n`;
                    text += data.afkList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
                    text += '\n';
                }
                m.edit(text).catch((err) => console.log(`Failed to finalize in mass check!\n${err.message}`));
            };
            const resultsMessage = yield sendmessage_1.default(message.channel, `Mass AFK-checking for ${channelMonitor.name}...`);
            if (!resultsMessage) {
                console.log('Failure creating results message for afkchecktop command');
                return;
            }
            const top = channelMonitor.queue.slice(0, channelMonitor.displaySize).map((user) => message.guild.members.cache.get(user.id));
            const afkChecker = new afk_checker_1.default(client, server, channelMonitor, top);
            afkChecker.on('update', (data) => {
                update(resultsMessage, data);
            });
            const results = yield afkChecker.run();
            finalize(resultsMessage, results);
            afkChecker.removeAllListeners('update');
        });
    }
}
exports.default = AfkCheckTopCommand;
