const EventEmitter = require('events');

class AFKChecker extends EventEmitter {
  constructor(client, server, channelMonitor, users) {
    super();

    this.client = client;
    this.server = server;
    this.channelMonitor = channelMonitor;
    this.users = users;
    this.lastEmit = 0;
  }

  async runSingle(userToCheck) {
    let guild = this.client.guilds.resolve(this.server.id);
    let voiceState = guild.members.cache.get(userToCheck.id).voice;

    if ((Date.now() - this.channelMonitor.lastAfkChecked[userToCheck.id]) < 300000) {
      this.recentlyChecked++;
      this.emitIfSafe();
      return;
    }
    this.channelMonitor.lastAfkChecked[userToCheck.id] = Date.now() + this.channelMonitor.afkCheckDuration;
    
    let mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';
    await userToCheck.send(mentionMessage).then(msg => {
      msg.react('👍')
        .catch(err => {
          console.log(`Failed to add reaction!\n${err.message}`);
        });

      const filter = (reaction, user) => {
          return ['👍'].includes(reaction.emoji.name) && user.id === userToCheck.id;
      };

      let halfwayTimer = setTimeout(() => {
        userToCheck.send('WARNING! Half of the afk check duration has elapsed! React now to keep your spot in queue!')
          .catch(err => {
            console.log(`Failed to send halfway-mark message!\n${err.message}`);
          });
      }, this.channelMonitor.afkCheckDuration / 2);

      return msg.awaitReactions(filter, { max: 1, time: this.channelMonitor.afkCheckDuration, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '👍') {
              msg.edit('**[AFK CHECK]**\nThank you! You will be kept in the queue.')
                .catch(err => console.log(`Failed to edit message!\n${err.message}`));
              clearTimeout(halfwayTimer);
              this.notAFK++;
              this.emitIfSafe();
              this.channelMonitor.lastAfkChecked[userToCheck.id] = Date.now();
              return;
            }
        })
        .catch(collected => {
          voiceState.kick().catch(err => console.error(`Failed to kick user!\n${err.message}`));
          this.channelMonitor.removeUserFromQueue(userToCheck.id);
          this.afk++;
          this.emitIfSafe();
          msg.reply('You failed to react to the message in time. You have been removed from the queue.')
            .catch(err => console.log(`Failed to send missed check message!\n${err.message}`));
          return;
        });
    }).catch(err => {
      if (err.code === 50007) {
        voiceState.kick();
      }
      console.log(`Failed to send AFK check message to user ${userToCheck.id}!\n${err.message}`);
    });
  }

  async run() {
    let guild = this.client.guilds.resolve(this.server.id);

    let members = this.users.map(user => guild.members.cache.get(user.id));

    let actuallyInVC = members.filter(member => (member.voice && member.voice.channelID === this.channelMonitor.id));

    this.recentlyChecked = 0;
    this.notInVC = this.users.length - actuallyInVC.length;
    this.notAFK = 0;
    this.afk = 0;

    let promises = actuallyInVC.map(user => this.runSingle(user));
    await Promise.all(promises);

    return {
      recentlyChecked: this.recentlyChecked,
      notInVC: this.notInVC,
      notAFK: this.notAFK,
      afk: this.afk
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
      afk: this.afk
    });
  }
}

module.exports = AFKChecker;