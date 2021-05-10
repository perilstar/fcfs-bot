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
const afk_checker_1 = __importDefault(require("../struct/afk_checker"));
const arg_parse_failure_1 = __importDefault(require("../util/arg_parse_failure"));
const mps_helper_1 = __importDefault(require("../util/mps_helper"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class AfkCheckCommand extends discord_akairo_1.Command {
    constructor() {
        super('afkcheck', {
            aliases: ['afkcheck', 'afk'],
            quoted: true,
            channel: 'guild',
            userPermissions: (message) => mps_helper_1.default(this.client, message),
            args: [
                {
                    id: 'member',
                    type: 'queuedMember',
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
            const resultsMessage = yield sendmessage_1.default(message.channel, 'AFK Checking...');
            if (!resultsMessage) {
                console.log('Failure creating results message for afkcheck command');
                return;
            }
            const afkChecker = new afk_checker_1.default(client, server, server.channelMonitors[args.member.voice.channelID], [args.member]);
            const results = yield afkChecker.run();
            if (results.recentlyChecked > 0) {
                resultsMessage.edit('That user was recently AFK-Checked. Try again later.')
                    .catch((err) => console.log(`Failed to skip manual check!\n${err.message}`));
            }
            else if (results.pushedBack > 0) {
                resultsMessage.edit('User is AFK. Pushing them back 20 spots.')
                    .catch((err) => console.log(`Failed to update pushedBack in manual check!\n${err.message}`));
            }
            else if (results.kicked > 0) {
                resultsMessage.edit('User is AFK. Removing them from the queue.')
                    .catch((err) => console.log(`Failed to update kicked in manual check!\n${err.message}`));
            }
            else if (results.notAFK > 0) {
                resultsMessage.edit('User is not AFK. Keeping them in the queue.')
                    .catch((err) => console.log(`Failed to update not afk in manual check!\n${err.message}`));
            }
        });
    }
}
exports.default = AfkCheckCommand;
