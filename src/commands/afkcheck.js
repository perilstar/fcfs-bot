const { Command } = require('discord-akairo');
const mps_helper = require('../util/mps_helper');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
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
          type: 'queuedMember',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'member', failure)
        },
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let resultsMessage = await sendmessage(message.channel, 'AFK Checking...');
    let afkChecker = new AFKChecker(this.client, server, server.channelMonitors[args.member.voice.channelID], [args.member]);
    let results = await afkChecker.run();

    if (results.recentlyChecked > 0) {
      resultsMessage.edit('That user was recently AFK-Checked. Try again later.').catch(err => console.log(`Failed to skip manual check!\n${err.message}`));
    } else if (results.afk > 0) {
      resultsMessage.edit('User is AFK. Removing them from the queue.').catch(err => console.log(`Failed to update afk in manual check!\n${err.message}`));
    } else if (results.notAFK > 0) {
      resultsMessage.edit('User is not AFK. Keeping them in the queue.').catch(err => console.log(`Failed to update not afk in manual check!\n${err.message}`));
    }

    return;
  }
}

module.exports = AfkCheckCommand;