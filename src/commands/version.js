const { Command } = require('discord-akairo');
const { TextChannel } = require('discord.js');
const sendmessage = require('../util/sendmessage');

class VersionCommand extends Command {
  constructor() {
    super('version', {
      aliases: ['version', 'v']
    });
  }

  async exec(message, args) {
    sendmessage(message.channel, `v${this.client.version}`);
  }
}

module.exports = VersionCommand;