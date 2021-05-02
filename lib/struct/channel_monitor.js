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
const afk_check_scheduler_1 = __importDefault(require("./afk_check_scheduler"));
class ChannelMonitor {
    constructor(client, data) {
        this.channel = null;
        this._name = null;
        this._displayChannelName = null;
        this._afkCheckScheduler = null;
        this._queue = [];
        this.updateTimer = null;
        this._client = client;
        this._guildID = data.guildID;
        this._id = data.id;
        this._displayChannel = data.displayChannel;
        this._displayMessage = data.displayMessage;
        this._rejoinWindow = data.rejoinWindow;
        this._displaySize = data.displaySize;
        this._afkCheckDuration = data.afkCheckDuration;
        this._lastAfkChecked = {};
        this.removalTimers = {};
        this.snowflakeQueue = data.snowflakeQueue;
        this.automatic = data.automatic;
        this._autoOutput = data.autoOutput;
        this._initialised = false;
        this.initialising = false;
    }
    get client() {
        return this._client;
    }
    get guildID() {
        return this._guildID;
    }
    get id() {
        return this._id;
    }
    get displayChannel() {
        return this._displayChannel;
    }
    get displayMessage() {
        return this._displayMessage;
    }
    get rejoinWindow() {
        return this._rejoinWindow;
    }
    get displaySize() {
        return this._displaySize;
    }
    get afkCheckDuration() {
        return this._afkCheckDuration;
    }
    get lastAfkChecked() {
        return this._lastAfkChecked;
    }
    get autoOutput() {
        return this._autoOutput;
    }
    set autoOutput(snowflake) {
        this._autoOutput = snowflake;
    }
    get initialised() {
        return this._initialised;
    }
    get name() {
        return this._name;
    }
    get displayChannelName() {
        return this._displayChannelName;
    }
    get afkCheckScheduler() {
        return this._afkCheckScheduler;
    }
    get queue() {
        return this._queue;
    }
    set queue(data) {
        this._queue = data;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialised || this.initialising)
                return;
            this.initialising = true;
            this.channel = this.client.channels.resolve(this.id);
            if (!this.channel)
                return;
            this._name = this.channel.name;
            const displayChannelObj = this.client.channels.resolve(this.displayChannel);
            if (!displayChannelObj)
                return;
            this._displayChannelName = displayChannelObj.name;
            yield this.populateQueue(this.snowflakeQueue);
            this.updateDisplay();
            this._afkCheckScheduler = new afk_check_scheduler_1.default(this.client, this, this.automatic);
            this._afkCheckScheduler.start();
            this._initialised = true;
            this.initialising = false;
        });
    }
    populateQueue(_snowflakeQueue) {
        return __awaiter(this, void 0, void 0, function* () {
            const snowflakeQueue = _snowflakeQueue.filter((id) => this.channel.members.get(id) !== undefined);
            this._queue = [];
            yield Promise.all(snowflakeQueue.map((snowflake) => {
                return this.client.users.fetch(snowflake);
            })).then((users) => {
                this._queue = users.filter(Boolean);
            });
            if (this.queue.length < this.channel.members.size) {
                const currentlyConnected = this.channel.members;
                const rest = currentlyConnected
                    .random(currentlyConnected.size)
                    .filter((user) => !this.queue.some((u) => u.id === user.id));
                rest.forEach((guildMember) => {
                    this.queue.push(guildMember.user);
                });
            }
            this._queue = this.queue.filter((value, index, self) => self.indexOf(value) === index);
            this.client.dataSource.saveMonitor(this.id);
        });
    }
    get message() {
        const guild = this.client.guilds.resolve(this.guildID);
        if (!guild)
            return 'BIG FAILURE UH OH';
        const title = `**${this.name} Queue:**`;
        const top = this.queue.slice(0, this.displaySize).map((user, index) => {
            const member = guild.members.cache.get(user.id);
            if (!member)
                return 'Something went wrong retrieving this user!';
            return `${index + 1}. ${member.displayName} (${user.tag})`;
        }).join('\n');
        return `${title}\n\`\`\`\n${top.length ? top : '<EMPTY>'}\n\`\`\``;
    }
    addUserToQueue(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialised)
                yield this.init();
            if (this.removalTimers[userID]) {
                clearTimeout(this.removalTimers[userID]);
                delete this.removalTimers[userID];
            }
            else {
                const user = this.client.users.resolve(userID);
                if (!user)
                    return;
                this.queue.push(user);
                this.timeoutUpdateDisplay();
                this.client.dataSource.saveMonitor(this.id);
            }
        });
    }
    timeoutRemoveUserFromQueue(userID) {
        const removeIndex = this.queue.findIndex((el) => el.id === userID);
        if (removeIndex === -1)
            return;
        this.removalTimers[userID] = setTimeout(() => {
            this.removeUserFromQueue(userID);
        }, this.rejoinWindow);
    }
    removeUserFromQueue(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialised)
                yield this.init();
            const removeIndex = this.queue.findIndex((el) => el.id === userID);
            if (removeIndex === -1)
                return;
            this.queue.splice(removeIndex, 1);
            this.timeoutUpdateDisplay();
            this.client.dataSource.saveMonitor(this.id);
            delete this.removalTimers[userID];
        });
    }
    timeoutUpdateDisplay() {
        if (this.updateTimer)
            return;
        this.updateTimer = setTimeout(() => this.updateDisplay(), 1500);
    }
    updateDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialised)
                yield this.init();
            this.updateTimer = null;
            try {
                const displayChannelObj = this.client.channels.resolve(this.displayChannel);
                if (!displayChannelObj)
                    return;
                displayChannelObj.messages.fetch(this.displayMessage).then((message) => {
                    const messageText = this.message;
                    if (!messageText)
                        return;
                    message.edit(discord_js_1.Util.removeMentions(messageText));
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.default = ChannelMonitor;
