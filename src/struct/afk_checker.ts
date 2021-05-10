import {
  MessageReaction, GuildMember, User,
} from 'discord.js';

import EventEmitter from 'events';
import type FCFSClient from '../fcfsclient';
import type ChannelMonitor from './channel_monitor';
import type Server from './server';

export interface AFKCheckData {
  recentlyChecked: number,
  notInVC: number,
  notAFK: number,
  afk: number,
  recentlyCheckedList: Array<GuildMember>,
  notInVCList: Array<GuildMember>,
  notAFKList: Array<GuildMember>,
  afkList: Array<GuildMember>,
}

export default class AFKChecker extends EventEmitter {
  private client: FCFSClient;

  private server: Server;

  private channelMonitor: ChannelMonitor;

  private members: Array<GuildMember>;

  private lastEmit: number;

  private recentlyChecked: number = 0;

  private notAFK: number = 0;

  private afk: number = 0;

  private notInVC: number = 0;

  private recentlyCheckedList: Array<GuildMember> = [];

  private notAFKList: Array<GuildMember> = [];

  private afkList: Array<GuildMember> = [];

  private notInVCList: Array<GuildMember> = [];

  // eslint-disable-next-line no-undef
  private emitTimer: NodeJS.Timer | null = null;

  constructor(
    client: FCFSClient,
    server: Server,
    channelMonitor: ChannelMonitor,
    members: Array<GuildMember>,
  ) {
    super();

    this.client = client;
    this.server = server;
    this.channelMonitor = channelMonitor;
    this.members = members;
    this.lastEmit = 0;
  }

  async runSingle(memberToCheck: GuildMember) {
    const voiceState = memberToCheck.voice;

    if ((Date.now() - this.channelMonitor.lastAfkChecked[memberToCheck.id]) < 300000) {
      this.recentlyChecked++;
      this.recentlyCheckedList.push(memberToCheck);
      this.emitIfSafe();
      return;
    }
    this.channelMonitor.lastAfkChecked[memberToCheck.id] = Date.now() + this.channelMonitor.afkCheckDuration;

    const mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';
    await memberToCheck.send(mentionMessage).then((msg) => {
      msg.react('👍')
        .catch((err) => {
          console.log(`Failed to add reaction!\n${err.message}`);
        });

      // eslint-disable-next-line arrow-body-style
      const filter = (reaction: MessageReaction, user: User) => {
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
          voiceState.kick().catch((err) => console.error(`Failed to kick user!\n${err.message}`));
          this.channelMonitor.removeUserFromQueue(memberToCheck.id);
          this.afk++;
          this.afkList.push(memberToCheck);
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
  }

  async run() {
    const actuallyInVC = this.members
      .filter((member) => (member.voice && member.voice.channelID === this.channelMonitor.id));

    this.recentlyChecked = 0;
    this.notInVC = this.members.length - actuallyInVC.length;
    this.notInVCList = this.members.filter((member) => !actuallyInVC.includes(member));
    this.notAFK = 0;
    this.afk = 0;

    const promises = actuallyInVC.map((member) => this.runSingle(member));
    await Promise.all(promises);

    return {
      recentlyChecked: this.recentlyChecked,
      notInVC: this.notInVC,
      notAFK: this.notAFK,
      afk: this.afk,
      recentlyCheckedList: this.recentlyCheckedList,
      notInVCList: this.notInVCList,
      notAFKList: this.notAFKList,
      afkList: this.afkList,
    };
  }

  emitIfSafe() {
    if (Date.now() - this.lastEmit < 10000) return;
    if (this.emitTimer) return;
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
      afk: this.afk,
      recentlyCheckedList: this.recentlyCheckedList,
      notInVCList: this.notInVCList,
      notAFKList: this.notAFKList,
      afkList: this.afkList,
    });
  }
}
