const { Command } = require('discord-akairo');
const mps_mod = require('../util/mps_mod');
const sendmessage = require('../util/sendmessage');

class AfkCheckTopCommand extends Command {
  constructor() {
    super('afkchecktop', {
      aliases: ['afkchecktop'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: message => mps_mod(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'voiceChannel'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }

    let channelMonitor = server.channelMonitors[args.monitorChannel.id];

    if (!channelMonitor.queue.length) {
      return sendmessage(message.channel, `Error: there are no members in queue in ${args.monitorChannel.name}`);
    }

    if ((Date.now() - channelMonitor.lastMassAfkCheck) < Math.max(900000, 300000 + channelMonitor.afkCheckDuration)) {
      return sendmessage(message.channel, 'The mass afk check command is on cooldown for that channel.');
    }
    channelMonitor.lastMassAfkCheck = Date.now();

    let resultsMessage = await message.channel.send('Mass AFK-checking...');

    let mentionMessage = '**[AFK CHECK]**\nPress thumbs up if you are not AFK to keep your place in the waiting list';

    let top = channelMonitor.queue.slice(0, channelMonitor.displaySize).map(user => message.guild.members.cache.get(user.id));

    let actuallyInVC = top.filter(member => (member.voice && member.voice.channelID === channelMonitor.id));

    let notInVC = top.length - actuallyInVC.length;
    let notAFK = 0;
    let afk = 0;

    const update = (message) => {
      let text = `Mass AFK-checking...\n\n`;
      if (notInVC) text += `${notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
      if (notAFK) text += `${notAFK} member(s) reacted to the message in time\n`;
      if (afk) text += `${afk} member(s) were booted from the queue\n`;

      message.edit(text).catch(() => {});
    };

    const finalize = (message) => {
      let text = `Mass AFK-checking complete!\n\n`;
      if (notInVC) text += `${notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
      if (notAFK) text += `${notAFK} member(s) reacted to the message in time\n`;
      if (afk) text += `${afk} member(s) were booted from the queue\n`;

      message.edit(text).catch(() => {});
    };

    if (!actuallyInVC.length) return finalize(resultsMessage);

    let updateInterval = setInterval(() => update(resultsMessage), 10000);

    actuallyInVC.forEach(member => {
      member.send(mentionMessage).then(msg => {
        msg.react('👍');
  
        const filter = (reaction, user) => {
            return ['👍'].includes(reaction.emoji.name) && user.id === member.id;
        };
  
        msg.awaitReactions(filter, { max: 1, time: channelMonitor.afkCheckDuration, errors: ['time'] })
          .then(collected => {
              const reaction = collected.first();
  
              if (reaction.emoji.name === '👍') {
                msg.edit('**[AFK CHECK]**\nThank you! You will be kept in the queue.');
                notAFK++;
                if (afk + notAFK >= actuallyInVC.length) {
                  clearInterval(updateInterval);
                  finalize(resultsMessage);
                }
              }
          })
          .catch(collected => {
            member.voice.kick();
            channelMonitor.removeUserFromQueue(member.id);
            msg.reply('You failed to react to the message in time. You have been removed from the queue.');
            afk++;
            if (afk + notAFK >= actuallyInVC.length) {
              clearInterval(updateInterval);
              finalize(resultsMessage);
            }
          });
      });
    });
  }
}

module.exports = AfkCheckTopCommand;