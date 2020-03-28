const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class PingAfkCommand extends Command {
  constructor() {
    super('pingafk', {
      aliases: ['pingafk', 'afk', 'afkcheck'],
      split: 'quoted',
      channel: 'guild'
    });
  }

  async exec(message, args) {

    let mention = message.mentions.users.first();
  
    if (mention == null) {
      return sendmessage(message.channel, `Error: Missing argument: \`mentionUser\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];
    let guild = this.client.guilds.resolve(message.guild.id);

    let voiceState = guild.members.resolve(mention.id).voice;

    if (!voiceState.channelID) {
      return sendmessage(message.channel, 'Error: User is not in a voice channel');
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return sendmessage(message.channel, 'Error: User is not in a monitored channel');
    }

    if (channelMonitor.restrictedMode) {
      let sender = message.author;
      let senderMember = guild.members.resolve(sender.id);
      if (!senderMember.permissions.has('ADMINISTRATOR') && !senderMember.roles.cache.some(role => channelMonitor.modRoles.includes(role.id))) {
        return sendmessage(message.channel, 'That user is in a channel which is in Restricted Mode, and you aren\'t a mod for it!');
      }
    }

    if ((Date.now() - channelMonitor.lastAfkChecked[mention.id]) < 10000) {
      return sendmessage(message.channel, 'Please don\'t spam the AFK Check command on that user! (Think of the pings!)');
    }
    channelMonitor.lastAfkChecked[mention.id] = Date.now() + channelMonitor.afkCheckDuration;

    let mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';
    mention.send(mentionMessage).then(msg => {
      msg.react('👍');

      const filter = (reaction, user) => {
          return ['👍'].includes(reaction.emoji.name) && user.id === mention.id;
      };

      msg.awaitReactions(filter, { max: 1, time: channelMonitor.afkCheckDuration, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '👍') {
              msg.edit('**[AFK CHECK]**\nThank you! You will be kept in the queue.');
              channelMonitor.lastAfkChecked[mention.id] = Date.now();
            }
        })
        .catch(collected => {
          voiceState.kick();

          msg.reply('You failed to react to the message in time. You have been removed from the queue.');
        });
    });
    return sendmessage(message.channel, 'AFK-checking')
  }
}

module.exports = PingAfkCommand;