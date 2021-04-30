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
const constants_1 = __importDefault(require("../util/constants"));
const mps_admin_1 = __importDefault(require("../util/mps_admin"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class SetDisplaySizeCommand extends discord_akairo_1.Command {
    constructor() {
        super('setdisplaysize', {
            aliases: ['setdisplaysize', 'set-displaysize', 'set-display-size', 'sds'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
            args: [
                {
                    id: 'monitorChannel',
                    type: 'monitorChannel',
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'monitorChannel', failure);
                    },
                },
                {
                    id: 'displaySize',
                    type: (message, phrase) => __awaiter(this, void 0, void 0, function* () {
                        const client = this.client;
                        const n = client.commandHandler.resolver.type('required')(message, phrase);
                        if (discord_akairo_1.Argument.isFailure(n))
                            return n;
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
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'displaySize', failure);
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
            channelMonitor.displaySize = args.displaySize;
            channelMonitor.updateDisplay();
            ds.saveMonitor(channelMonitor.id);
            sendmessage_1.default(message.channel, `Successfully changed queue max display length for ${channelMonitor.name} to ${args.displaySize}!`);
        });
    }
}
exports.default = SetDisplaySizeCommand;
