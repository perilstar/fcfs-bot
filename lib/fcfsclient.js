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
const discord_js_1 = require("discord.js");
const discord_akairo_1 = require("discord-akairo");
const data_source_1 = __importDefault(require("./struct/data_source"));
const client_ready_1 = __importDefault(require("./listeners/client_ready"));
const arg_types_registrar_1 = __importDefault(require("./util/arg_types_registrar"));
const { version } = require('../package.json');
require('dotenv').config();
const TOKEN = process.env.FCFS_BOT_TOKEN;
class FCFSClient extends discord_akairo_1.AkairoClient {
    constructor() {
        super({
            ownerID: ['148611805445357569', '346826796483870741'],
        }, {
            disableMentions: 'everyone',
        });
        this._ready = false;
        this._dataSource = new data_source_1.default(this);
        this._commandHandler = new discord_akairo_1.CommandHandler(this, {
            directory: './src/commands/',
            prefix: (message) => {
                if (message.channel instanceof discord_js_1.TextChannel) {
                    return ['fcfs!', this.dataSource.servers[message.channel.guild.id].prefix];
                }
                if (message.channel instanceof discord_js_1.DMChannel) {
                    return ['fcfs!', ''];
                }
                return '';
            },
            allowMention: true,
        });
        const atr = new arg_types_registrar_1.default(this);
        atr.registerTypes();
        this._listenerHandler = new discord_akairo_1.ListenerHandler(this, {
            directory: './src/listeners/',
        });
        this._inhibitorHandler = new discord_akairo_1.InhibitorHandler(this, {});
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler,
        });
        this.listenerHandler.load(client_ready_1.default);
        this._version = version;
    }
    get dataSource() {
        return this._dataSource;
    }
    get commandHandler() {
        return this._commandHandler;
    }
    get listenerHandler() {
        return this._listenerHandler;
    }
    get inhibitorHandler() {
        return this._inhibitorHandler;
    }
    get version() {
        return this._version;
    }
    get ready() {
        return this._ready;
    }
    set ready(value) {
        if (!value)
            return;
        this._ready = value;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Logging in with token');
            return this.login(TOKEN);
        });
    }
}
exports.default = FCFSClient;
