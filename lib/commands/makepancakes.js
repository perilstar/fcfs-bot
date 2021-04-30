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
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class MakePancakesCommand extends discord_akairo_1.Command {
    constructor() {
        super('makepancakes', {
            aliases: ['makepancakes', 'pancakes'],
            quoted: true,
            channel: 'dm',
        });
    }
    exec(message, _args) {
        return __awaiter(this, void 0, void 0, function* () {
            sendmessage_1.default(message.channel, '🥞');
        });
    }
}
exports.default = MakePancakesCommand;
