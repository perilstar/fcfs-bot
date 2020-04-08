const { Command } = require('discord-akairo');
const mps_helper = require('../util/mps_helper');
const sendmessage = require('../util/sendmessage');
const AFKChecker = require('../struct/afk_checker');

class AfkCheckCommand extends Command {
  constructor() {
    super('afkcheck', {
      aliases: ['afkcheck', 'afk'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: message => mps_helper(this.client, message),
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
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`member\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let voiceState = args.member.voice;

    if (!voiceState.channelID) {
      return sendmessage(message.channel, `Error: ${args.member.displayName} is not in a voice channel`);
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return sendmessage(message.channel, `Error: ${args.member.displayName} is not in a monitored channel`);
    }

    let resultsMessage = await sendmessage(message.channel, 'AFK Checking...');
    let afkChecker = new AFKChecker(this.client, server, channelMonitor, [args.member]);
    let results = await afkChecker.run();

    if (results.recentlyChecked > 0) {
      resultsMessage.edit('That user was recently AFK-Checked. Try again later.').catch(() => {});
    } else if (results.afk > 0) {
      resultsMessage.edit('User is AFK. Removing them from the queue.').catch(() => {});
    } else if (results.notAFK > 0) {
      resultsMessage.edit('User is not AFK. Keeping them in the queue.').catch(() => {});
    }

    return;
  }
}

module.exports = AfkCheckCommand;