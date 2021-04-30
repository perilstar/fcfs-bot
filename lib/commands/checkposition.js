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
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class CheckPositionCommand extends discord_akairo_1.Command {
    constructor() {
        super('checkposition', {
            aliases: ['checkposition', 'position', 'p'],
            quoted: true,
            channel: 'guild',
            args: [
                {
                    id: 'member',
                    type: (message, phrase) => {
                        const client = this.client;
                        let member;
                        if (phrase) {
                            member = client.commandHandler.resolver.type('member')(message, phrase);
                            if (!member)
                                return discord_akairo_1.Flag.fail({ reason: 'notAMember', phrase });
                        }
                        else {
                            const guild = client.guilds.resolve(message.guild.id);
                            member = guild.members.resolve(message.author.id);
                        }
                        const voiceState = member.voice;
                        if (!voiceState.channelID)
                            return discord_akairo_1.Flag.fail({ reason: 'memberNotInVoice', member });
                        const ds = client.dataSource;
                        const server = ds.servers[message.guild.id];
                        const channelMonitor = server.channelMonitors[voiceState.channelID];
                        if (!channelMonitor)
                            return discord_akairo_1.Flag.fail({ reason: 'memberNotInMonitoredChannel', member });
                        return member;
                    },
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'member', failure),
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const server = ds.servers[message.guild.id];
            const voiceState = args.member.voice;
            const channelMonitor = server.channelMonitors[voiceState.channelID];
            const position = channelMonitor.queue.findIndex((user) => user.id === args.member.id) + 1;
            sendmessage_1.default(message.channel, `${args.member.displayName}'s position in ${channelMonitor.name}: ${position}`);
        });
    }
}
exports.default = CheckPositionCommand;
