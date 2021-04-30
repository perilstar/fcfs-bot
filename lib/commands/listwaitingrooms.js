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
const mps_admin_1 = __importDefault(require("../util/mps_admin"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class ListWaitingRoomsCommand extends discord_akairo_1.Command {
    constructor() {
        super('listwaitingrooms', {
            aliases: ['listwaitingrooms', 'lwr'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_admin_1.default(this.client, message),
            args: [
                {
                    id: 'page',
                    type: 'integer',
                },
            ],
        });
    }
    exec(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const page = (_a = args.page) !== null && _a !== void 0 ? _a : 1;
            const ds = client.dataSource;
            const server = ds.servers[message.guild.id];
            const { channelMonitors } = server;
            const monitoredNames = [];
            const displayNames = [];
            Object.keys(channelMonitors).forEach((snowflake) => __awaiter(this, void 0, void 0, function* () {
                if (!channelMonitors[snowflake].initialised) {
                    yield channelMonitors[snowflake].init();
                }
                monitoredNames.push(channelMonitors[snowflake].name);
                displayNames.push(channelMonitors[snowflake].displayChannelName);
            }));
            const lines = [];
            for (let i = 0; i < monitoredNames.length; i++) {
                lines.push(`'${monitoredNames[i]}' queue is displayed in '#${displayNames[i]}'`);
            }
            const pages = Math.ceil(lines.length / 10);
            let currentPage = [];
            if (page > pages || page < 1) {
                currentPage = ['<NONE>'];
            }
            else {
                currentPage = lines.slice((page - 1) * 10, 10);
            }
            const text = `\`\`\`\n${currentPage.join('\n')}\n\nPage ${page}/${pages}\`\`\``;
            sendmessage_1.default(message.channel, text);
        });
    }
}
exports.default = ListWaitingRoomsCommand;
