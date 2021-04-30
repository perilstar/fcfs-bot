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
class SetRejoinWindowCommand extends discord_akairo_1.Command {
    constructor() {
        super('setrejoinwindow', {
            aliases: ['setrejoinwindow', 'set-rejoinwindow', 'set-rejoin-window', 'srw'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
            args: [
                {
                    id: 'monitorChannel',
                    type: 'monitorChannel',
                },
                {
                    id: 'rejoinWindow',
                    type: (message, phrase) => {
                        const client = this.client;
                        const n = client.commandHandler.resolver.type('duration')(message, phrase);
                        if (discord_akairo_1.Argument.isFailure(n))
                            return n;
                        const min = constants_1.default.RejoinWindow.MIN;
                        const max = constants_1.default.RejoinWindow.MAX;
                        if (n < parse_duration_1.default(min) || n > parse_duration_1.default(max)) {
                            return discord_akairo_1.Flag.fail({
                                reason: 'outOfRange', n, min, max,
                            });
                        }
                        return n;
                    },
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'rejoinWindow', failure);
                    },
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const channelMonitor = args.monitorChannel;
            if (!channelMonitor.initialised) {
                yield channelMonitor.init();
            }
            channelMonitor.rejoinWindow = args.rejoinWindow;
            ds.saveMonitor(channelMonitor.id);
            sendmessage_1.default(message.channel, `Successfully changed rejoin window for ${channelMonitor.name} to ${pretty_ms_1.default(channelMonitor.rejoinWindow)}!`);
        });
    }
}
exports.default = SetRejoinWindowCommand;
