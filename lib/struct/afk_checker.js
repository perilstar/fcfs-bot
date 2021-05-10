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
const events_1 = __importDefault(require("events"));
class AFKChecker extends events_1.default {
    constructor(client, server, channelMonitor, members) {
        super();
        this.recentlyChecked = 0;
        this.notAFK = 0;
        this.pushedBack = 0;
        this.kicked = 0;
        this.notInVC = 0;
        this.recentlyCheckedList = [];
        this.notAFKList = [];
        this.pushedBackList = [];
        this.kickedList = [];
        this.notInVCList = [];
        this.emitTimer = null;
        this.client = client;
        this.server = server;
        this.channelMonitor = channelMonitor;
        this.members = members;
        this.lastEmit = 0;
    }
    runSingle(memberToCheck) {
        return __awaiter(this, void 0, void 0, function* () {
            const voiceState = memberToCheck.voice;
            if ((Date.now() - this.channelMonitor.lastAfkChecked[memberToCheck.id]) < 300000) {
                this.recentlyChecked++;
                this.recentlyCheckedList.push(memberToCheck);
                this.emitIfSafe();
                return;
            }
            this.channelMonitor.lastAfkChecked[memberToCheck.id] = Date.now() + this.channelMonitor.afkCheckDuration;
            const mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';
            yield memberToCheck.send(mentionMessage).then((msg) => {
                msg.react('👍')
                    .catch((err) => {
                    console.log(`Failed to add reaction!\n${err.message}`);
                });
                const filter = (reaction, user) => {
                    return ['👍'].includes(reaction.emoji.name) && user.id === memberToCheck.id;
                };
                const halfwayTimer = setTimeout(() => {
                    memberToCheck.send('WARNING! Half of the afk check duration has elapsed! React now to keep your spot in queue!')
                        .catch((err) => {
                        console.log(`Failed to send halfway-mark message!\n${err.message}`);
                    });
                }, this.channelMonitor.afkCheckDuration / 2);
                return msg.awaitReactions(filter, { max: 1, time: this.channelMonitor.afkCheckDuration, errors: ['time'] })
                    .then((collected) => {
                    const reaction = collected.first();
                    if (!reaction) {
                        memberToCheck.send('I messed up. Please notify peril#1024');
                        return;
                    }
                    if (reaction.emoji.name === '👍') {
                        msg.edit('**[AFK CHECK]**\nThank you! You will be kept in the queue.')
                            .catch((err) => console.log(`Failed to edit message!\n${err.message}`));
                        clearTimeout(halfwayTimer);
                        this.notAFK++;
                        this.notAFKList.push(memberToCheck);
                        this.emitIfSafe();
                        this.channelMonitor.lastAfkChecked[memberToCheck.id] = Date.now();
                    }
                })
                    .catch(() => {
                    const action = this.channelMonitor.pushBackOrKick(memberToCheck);
                    if (action === 'pushedBack') {
                        this.pushedBack++;
                        this.pushedBackList.push(memberToCheck);
                    }
                    else if (action === 'kicked') {
                        this.kicked++;
                        this.kickedList.push(memberToCheck);
                    }
                    else {
                        console.log('Tried to kick or push back but an error occurred!');
                    }
                    this.emitIfSafe();
                    msg.reply('You failed to react to the message in time. You have been removed from the queue.')
                        .catch((err) => console.log(`Failed to send missed check message!\n${err.message}`));
                });
            }).catch((err) => {
                if (err.code === 50007) {
                    voiceState.kick();
                }
                console.log(`Failed to send AFK check message to user ${memberToCheck.id}!\n${err.message}`);
            });
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const actuallyInVC = this.members
                .filter((member) => (member.voice && member.voice.channelID === this.channelMonitor.id));
            this.recentlyChecked = 0;
            this.notInVC = this.members.length - actuallyInVC.length;
            this.notInVCList = this.members.filter((member) => !actuallyInVC.includes(member));
            this.notAFK = 0;
            this.pushedBack = 0;
            this.kicked = 0;
            const promises = actuallyInVC.map((member) => this.runSingle(member));
            yield Promise.all(promises);
            return {
                recentlyChecked: this.recentlyChecked,
                notInVC: this.notInVC,
                notAFK: this.notAFK,
                pushedBack: this.pushedBack,
                kicked: this.kicked,
                recentlyCheckedList: this.recentlyCheckedList,
                notInVCList: this.notInVCList,
                notAFKList: this.notAFKList,
                pushedBackList: this.pushedBackList,
                kickedList: this.kickedList,
            };
        });
    }
    emitIfSafe() {
        if (Date.now() - this.lastEmit < 10000)
            return;
        if (this.emitTimer)
            return;
        this.emitTimer = setTimeout(() => {
            this.emitNow();
        }, 10000);
    }
    emitNow() {
        this.emitTimer = null;
        this.emit('update', {
            recentlyChecked: this.recentlyChecked,
            notInVC: this.notInVC,
            notAFK: this.notAFK,
            pushedBack: this.pushedBack,
            kicked: this.kicked,
            recentlyCheckedList: this.recentlyCheckedList,
            notInVCList: this.notInVCList,
            notAFKList: this.notAFKList,
            pushedBackList: this.pushedBackList,
            kickedList: this.kickedList,
        });
    }
}
exports.default = AFKChecker;
