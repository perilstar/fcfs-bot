const { Command } = require('discord-akairo');
const mps_mod = require('../util/mps_mod');
const sendmessage = require('../util/sendmessage');
const AFKChecker = require('../struct/afk_checker');

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

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }

    let channelMonitor = server.channelMonitors[args.monitorChannel.id];

    if (!channelMonitor.queue.length) {
      return sendmessage(message.channel, `Error: there are no members in queue in ${args.monitorChannel.name}`);
    }

    const update = (message, data) => {
      let text = `Mass AFK-checking...\n\n`;
      if (data.recentlyChecked) text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
      if (data.notInVC) text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
      if (data.notAFK) text += `${data.notAFK} member(s) reacted to the message in time\n`;
      if (data.afk) text += `${data.afk} member(s) were booted from the queue\n`;

      message.edit(text).catch(() => {});
    };

    const finalize = (message, data) => {
      let text = `Mass AFK-checking complete!\n\n`;
      if (data.recentlyChecked) text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
      if (data.notInVC) text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
      if (data.notAFK) text += `${data.notAFK} member(s) reacted to the message in time\n`;
      if (data.afk) text += `${data.afk} member(s) were booted from the queue\n`;

      message.edit(text).catch(() => {});
    };

    let resultsMessage = await sendmessage(message.channel, 'Mass AFK-checking...');

    let top = channelMonitor.queue.slice(0, channelMonitor.displaySize).map(user => message.guild.members.cache.get(user.id));

    let afkChecker = new AFKChecker(this.client, server, channelMonitor, top);

    afkChecker.on('update', (data) => {
      update(resultsMessage, data);
    });

    let results = await afkChecker.run();
    finalize(resultsMessage, results);
    afkChecker.removeAllListeners('update');

    return;
  }
}

module.exports = AfkCheckTopCommand;