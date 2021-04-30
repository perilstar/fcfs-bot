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
class QueueLengthCommand extends discord_akairo_1.Command {
    constructor() {
        super('queuelength', {
            aliases: ['queuelength', 'ql'],
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
            if (!args.monitorChannel.initialised) {
                yield args.monitorChannel.init();
            }
            sendmessage_1.default(message.channel, `${args.monitorChannel.name} has ${args.monitorChannel.queue.length} people in it.`);
        });
    }
}
exports.default = QueueLengthCommand;
