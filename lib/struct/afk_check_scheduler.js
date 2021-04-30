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
const afk_checker_1 = __importDefault(require("./afk_checker"));
const sendmessage_1 = __importDefault(require("../util/sendmessage"));
class AFKCheckScheduler {
    constructor(client, channelMonitor, interval) {
        this.startTimeout = null;
        this.intervalTimer = null;
        this.client = client;
        this.channelMonitor = channelMonitor;
        this._interval = interval;
    }
    get interval() {
        return this._interval;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = this.client.guilds.resolve(this.channelMonitor.guildID);
                if (!guild)
                    return;
                const server = this.client.dataSource.servers[guild.id];
                const outputChannel = guild.channels.resolve(this.channelMonitor.autoOutput);
                if (!outputChannel)
                    return;
                if (!this.channelMonitor.queue.length)
                    return;
                const update = (message, data) => {
                    let text = 'Auto AFK-checking...\n\n';
                    if (data.recentlyChecked)
                        text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
                    if (data.notInVC)
                        text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
                    if (data.notAFK)
                        text += `${data.notAFK} member(s) reacted to the message in time\n`;
                    if (data.afk)
                        text += `${data.afk} member(s) were booted from the queue\n`;
                    message.edit(text).catch((err) => console.log(`Failed to update in auto check!\n${err.message}`));
                };
                const finalize = (message, data) => {
                    let text = 'Auto AFK-checking complete!\n\n';
                    if (data.recentlyChecked)
                        text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
                    if (data.notInVC)
                        text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
                    if (data.notAFK)
                        text += `${data.notAFK} member(s) reacted to the message in time\n`;
                    if (data.afk)
                        text += `${data.afk} member(s) were booted from the queue\n`;
                    message.edit(text).catch((err) => console.log(`Failed to finalize in auto check!\n${err.message}`));
                };
                const resultsMessage = yield sendmessage_1.default(outputChannel, 'Auto AFK-checking...');
                if (!(resultsMessage instanceof discord_js_1.Message))
                    return;
                const top = this.channelMonitor.queue
                    .slice(0, this.channelMonitor.displaySize)
                    .map((user) => guild.members.cache.get(user.id))
                    .filter((value) => value !== undefined);
                if (!top)
                    return;
                const afkChecker = new afk_checker_1.default(this.client, server, this.channelMonitor, top);
                afkChecker.on('update', (data) => {
                    update(resultsMessage, data);
                });
                const results = yield afkChecker.run();
                finalize(resultsMessage, results);
                afkChecker.removeAllListeners('update');
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    start() {
        if (this.startTimeout)
            clearTimeout(this.startTimeout);
        if (this.intervalTimer)
            clearInterval(this.intervalTimer);
        if (this.interval === -1)
            return -1;
        const timeUntilNext = this.interval - (Date.now() % this.interval);
        this.startTimeout = setTimeout(() => {
            this.run();
            this.intervalTimer = setInterval(() => {
                this.run();
            }, this.interval);
        }, timeUntilNext);
        return timeUntilNext;
    }
    changeInterval(interval) {
        this._interval = interval;
        return this.start();
    }
}
exports.default = AFKCheckScheduler;
