const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class PingAfkCommand extends Command {
  constructor() {
    super('pingafk', {
      aliases: ['pingafk', 'afk', 'afkcheck'],
      split: 'quoted',
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.member) {
      return sendmessage(message.channel, `Error: Missing argument: \`member\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];
    let guild = this.client.guilds.resolve(message.guild.id);

    let voiceState = args.member.voice;

    if (!voiceState.channelID) {
      return sendmessage(message.channel, `Error: \`${args.member.displayName}\` is not in a voice channel`);
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return sendmessage(message.channel, `Error: \`${args.member.displayName}\` is not in a monitored channel`);
    }

    if (channelMonitor.restrictedMode) {
      let sender = message.author;
      let senderMember = guild.members.resolve(sender.id);
      if (mps(this.client, message) && !senderMember.roles.cache.some(role => channelMonitor.modRoles.includes(role.id))) {
        return sendmessage(message.channel, 'That user is in a channel which is in Restricted Mode, and you aren\'t a mod for it or a bot admin!');
      }
    }

    if ((Date.now() - channelMonitor.lastAfkChecked[args.member.id]) < 10000) {
      return sendmessage(message.channel, 'Please don\'t spam the AFK Check command on that user! (Think of the pings!)');
    }
    channelMonitor.lastAfkChecked[args.member.id] = Date.now() + channelMonitor.afkCheckDuration;

    let resultsMessage = await message.channel.send('AFK-checking...');

    let mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';
    args.member.send(mentionMessage).then(msg => {
      msg.react('👍');

      const filter = (reaction, user) => {
          return ['👍'].includes(reaction.emoji.name) && user.id === args.member.id;
      };

      msg.awaitReactions(filter, { max: 1, time: channelMonitor.afkCheckDuration, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '👍') {
              msg.edit('**[AFK CHECK]**\nThank you! You will be kept in the queue.');
              resultsMessage.edit('User is not AFK. Keeping them in the queue.').catch(() => {});
              channelMonitor.lastAfkChecked[args.member.id] = Date.now();
            }
        })
        .catch(collected => {
          voiceState.kick();
          resultsMessage.edit('User is AFK. Removing them from the queue.').catch(() => {});
          msg.reply('You failed to react to the message in time. You have been removed from the queue.');
        });
    });
  }
}

module.exports = PingAfkCommand;