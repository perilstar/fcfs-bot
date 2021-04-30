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
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const constants_1 = __importDefault(require("../util/constants"));
const mps_admin_1 = __importDefault(require("../util/mps_admin"));
class CreateWaitingRoomCommand extends discord_akairo_1.Command {
    constructor() {
        super('createwaitingroom', {
            aliases: ['createwaitingroom', 'cwr'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
            args: [
                {
                    id: 'monitorChannel',
                    type: 'voiceChannelCustom',
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'monitorChannel', failure),
                },
                {
                    id: 'displaySize',
                    type: (message, phrase) => __awaiter(this, void 0, void 0, function* () {
                        if (!phrase)
                            return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
                        const n = phrase;
                        const min = constants_1.default.DisplaySize.MIN;
                        const max = constants_1.default.DisplaySize.MAX;
                        const result = yield discord_akairo_1.Argument.range('integer', min, max, true).call(this, message, phrase);
                        if (discord_akairo_1.Argument.isFailure(result)) {
                            return discord_akairo_1.Flag.fail({
                                reason: 'outOfRange', n, min, max,
                            });
                        }
                        return n;
                    }),
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'displaySize', failure),
                },
                {
                    id: 'rejoinWindow',
                    type: (message, phrase) => {
                        const n = this.client.commandHandler.resolver.type('duration')(message, phrase);
                        const min = constants_1.default.RejoinWindow.MIN;
                        const max = constants_1.default.RejoinWindow.MAX;
                        if (n < parse_duration_1.default(min) || n > parse_duration_1.default(max)) {
                            return discord_akairo_1.Flag.fail({
                                reason: 'outOfRange', n, min, max,
                            });
                        }
                        return n;
                    },
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'rejoinWindow', failure),
                },
                {
                    id: 'afkCheckDuration',
                    type: (message, phrase) => {
                        const n = this.client.commandHandler.resolver.type('duration')(message, phrase);
                        const min = constants_1.default.AFKCheckDuration.MIN;
                        const max = constants_1.default.AFKCheckDuration.MAX;
                        if (n < parse_duration_1.default(min) || n > parse_duration_1.default(max)) {
                            return discord_akairo_1.Flag.fail({
                                reason: 'outOfRange', n, min, max,
                            });
                        }
                        return n;
                    },
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'afkCheckDuration', failure);
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
            const displayChannel = message.channel;
            const displayMessage = yield message.channel.send('<Pending Update>').catch(() => { });
            if (!displayMessage) {
                console.log('Failure creating a waiting room\'s display message!');
                return;
            }
            const data = {
                guildID: message.guild.id,
                id: args.monitorChannel.id,
                displayChannel: displayChannel.id,
                displayMessage: displayMessage.id,
                displaySize: args.displaySize,
                rejoinWindow: args.rejoinWindow,
                afkCheckDuration: args.afkCheckDuration,
                snowflakeQueue: [],
                automatic: -1,
                autoOutput: '',
            };
            message.delete();
            const channelMonitor = server.addChannelMonitor(data);
            yield channelMonitor.init();
            ds.saveMonitor(args.monitorChannel.id);
        });
    }
}
exports.default = CreateWaitingRoomCommand;
