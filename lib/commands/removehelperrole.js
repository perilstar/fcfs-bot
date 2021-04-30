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
class RemoveHelperRoleCommand extends discord_akairo_1.Command {
    constructor() {
        super('removehelperrole', {
            aliases: ['removehelperrole', 'remove-helperrole', 'rhr'],
            quoted: true,
            channel: 'guild',
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    id: 'role',
                    type: 'roleCustom',
                    otherwise: (msg, { failure }) => arg_parse_failure_1.default(msg, 'role', failure),
                },
            ],
        });
    }
    exec(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const ds = client.dataSource;
            const server = ds.servers[message.guild.id];
            const { helperRoles } = server;
            if (!helperRoles.includes(args.role.id)) {
                sendmessage_1.default(message.channel, `Error: ${args.role.name} is not set as bot helper!`);
                return;
            }
            const index = server.helperRoles.indexOf(args.role.id);
            server.helperRoles.splice(index, 1);
            ds.saveServer(server.id);
            sendmessage_1.default(message.channel, `Successfully removed role ${args.role.name} as bot helper!`);
        });
    }
}
exports.default = RemoveHelperRoleCommand;
