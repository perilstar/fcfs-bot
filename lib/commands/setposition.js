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
const mps_mod_1 = __importDefault(require("../util/mps_mod"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class SetPositionCommand extends discord_akairo_1.Command {
    constructor() {
        super('setposition', {
            aliases: ['setposition', 'sp'],
            quoted: true,
            userPermissions: (message) => mps_mod_1.default(this.client, message),
            channel: 'guild',
            args: [
                {
                    id: 'member',
                    type: 'queuedMember',
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'member', failure);
                    },
                },
                {
                    id: 'position',
                    type: (_message, phrase) => {
                        if (!phrase)
                            return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
                        const n = parseFloat(phrase);
                        if (Number.isNaN(n))
                            return discord_akairo_1.Flag.fail({ reason: 'notANumber', phrase });
                        return n;
                    },
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'position', failure);
                    },
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const server = ds.servers[message.guild.id];
            const channelMonitor = server.channelMonitors[args.member.voice.channelID];
            const position = args.position - 1;
            const index = channelMonitor.queue.findIndex((user) => user.id === args.member.id);
            channelMonitor.queue.splice(index, 1);
            channelMonitor.queue = [].concat(channelMonitor.queue.slice(0, position), args.member.user, channelMonitor.queue.slice(position));
            const newPosition = channelMonitor.queue.findIndex((user) => user.id === args.member.id) + 1;
            channelMonitor.timeoutUpdateDisplay();
            ds.saveMonitor(channelMonitor.id);
            sendmessage_1.default(message.channel, `${args.member.displayName}'s new position in ${channelMonitor.name}: ${newPosition}`);
        });
    }
}
exports.default = SetPositionCommand;
