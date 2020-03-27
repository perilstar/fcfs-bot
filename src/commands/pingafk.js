const { Command } = require('discord-akairo');

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
      return message.channel.send(`Error: Missing argument: \`mentionUser\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];
    let guild = this.client.guilds.resolve(message.guild.id);

    let voiceState = guild.members.resolve(mention.id).voice;

    if (!voiceState.channelID) {
      return message.channel.send('Error: User is not in a voice channel');
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return message.channel.send('Error: User is not in a monitored channel');
    }

    if (channelMonitor.restrictedMode) {
      let sender = message.author;
      let senderMember = guild.members.resolve(sender.id);
      if (!senderMember.permissions.has('ADMINISTRATOR') && !senderMember.roles.cache.some(role => channelMonitor.allowedRoles.includes(role.id))) {
        return message.channel.send('That user is in a channel which is in Restricted Mode, and your roles don\'t allow you to do this!');
      }
    }

    if ((Date.now() - channelMonitor.lastAfkChecked[mention.id]) < 10000) {
      return message.channel.send('Please don\'t spam the AFK Check command on that user! (Think of the pings!)');
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
    message.channel.send('AFK-checking...')
  }
}

module.exports = PingAfkCommand;