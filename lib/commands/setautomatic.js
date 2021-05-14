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
const parse_duration_1 = __importDefault(require("parse-duration"));
const pretty_ms_1 = __importDefault(require("pretty-ms"));
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const constants_1 = __importDefault(require("../util/constants"));
const mps_admin_1 = __importDefault(require("../util/mps_admin"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class SetDisplaySizeCommand extends discord_akairo_1.Command {
    constructor() {
        super('setautomatic', {
            aliases: ['setautomatic', 'set-automatic', 'sa'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
        });
    }
    *args() {
        const client = this.client;
        const monitorChannel = yield {
            type: 'monitorChannel',
            otherwise: (msg, { failure }) => {
                return arg_parse_failure_1.default(msg, 'monitorChannel', failure);
            },
        };
        const interval = yield {
            type: (message, phrase) => __awaiter(this, void 0, void 0, function* () {
                const min = constants_1.default.Interval.MIN;
                const max = constants_1.default.Interval.MAX;
                const result = yield discord_akairo_1.Argument.union(discord_akairo_1.Argument.compose('duration', discord_akairo_1.Argument.range('integer', parse_duration_1.default(min), parse_duration_1.default(max), true)), discord_akairo_1.Argument.validate('lowercase', (_m, _p, v) => v === 'off')).call(this, message, phrase);
                if (discord_akairo_1.Argument.isFailure(result)) {
                    return discord_akairo_1.Flag.fail({
                        reason: 'invalidInterval', n: result, min, max,
                    });
                }
                return result;
            }),
            otherwise: (msg, { failure }) => {
                return arg_parse_failure_1.default(msg, 'interval', failure);
            },
        };
        const outputChannel = yield {
            type: (message, phrase) => {
                if (interval === -1) {
                    return null;
                }
                if (phrase === '') {
                    return message.channel;
                }
                return client.commandHandler.resolver.type('textChannelCustom')(message, phrase);
            },
            otherwise: (msg, { failure }) => {
                return arg_parse_failure_1.default(msg, 'outputChannel', failure);
            },
        };
        return { monitorChannel, interval, outputChannel };
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const channelMonitor = args.monitorChannel;
            if (!channelMonitor.initialised) {
                yield channelMonitor.init();
            }
            const { outputChannel } = args;
            const nextCheck = channelMonitor.afkCheckScheduler.changeInterval(args.interval === 'off' ? -1 : args.interval);
            channelMonitor.autoOutput = outputChannel ? outputChannel.id : '';
            ds.saveMonitor(channelMonitor.id);
            let msg = `Successfully changed automatic mode for ${channelMonitor.name} to ${args.interval === 'off' ? 'OFF' : pretty_ms_1.default(args.interval)}`;
            if (args.interval !== 'off')
                msg += `,\noutputting to ${outputChannel.toString()}! Next automatic check in ${pretty_ms_1.default(nextCheck)}`;
            sendmessage_1.default(message.channel, msg);
        });
    }
}
exports.default = SetDisplaySizeCommand;
