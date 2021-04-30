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
const pretty_ms_1 = __importDefault(require("pretty-ms"));
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class InfoCommand extends discord_akairo_1.Command {
    constructor() {
        super('info', {
            aliases: ['info', 'wr'],
            quoted: true,
            channel: 'guild',
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
            const channelMonitor = args.monitorChannel;
            if (!channelMonitor.initialised) {
                yield channelMonitor.init();
            }
            const lines = [
                `Monitoring: ${channelMonitor.name} (ID ${channelMonitor.id})`,
                `Display: #${channelMonitor.displayChannelName} (ID ${channelMonitor.displayChannel})`,
                `Showing the first ${channelMonitor.displaySize} people in the queue`,
                `Rejoin Window: ${pretty_ms_1.default(channelMonitor.rejoinWindow)}`,
                `AFK Check Duration: ${pretty_ms_1.default(channelMonitor.afkCheckDuration)}`,
            ];
            sendmessage_1.default(message.channel, `**Waiting Room Info**\n\`\`\`\n${lines.join('\n')}\n\`\`\``);
        });
    }
}
exports.default = InfoCommand;
