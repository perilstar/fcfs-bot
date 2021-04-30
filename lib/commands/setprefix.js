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
const mps_admin_1 = __importDefault(require("../util/mps_admin"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class SetPrefixCommand extends discord_akairo_1.Command {
    constructor() {
        super('setprefix', {
            aliases: ['setprefix', 'set-prefix', 'prefix'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
            args: [
                {
                    id: 'prefix',
                    type: (message, phrase) => {
                        if (!phrase)
                            return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
                        return phrase;
                    },
                    otherwise: (msg, { failure }) => {
                        return arg_parse_failure_1.default(msg, 'prefix', failure);
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
            server.prefix = args.prefix;
            client.dataSource.saveServer(message.guild.id);
            sendmessage_1.default(message.channel, `Successfully changed prefix to ${args.prefix}`);
        });
    }
}
exports.default = SetPrefixCommand;
