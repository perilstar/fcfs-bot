const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class MakePancakesCommand extends Command {
  constructor() {
    super('makepancakes', {
      aliases: ['makepancakes', 'pancakes'],
      split: 'quoted',
      channel: 'dm'
    });
  }

  async exec(message, args) {
    returnsendmessage(message.channel, '🥞');
  }
}

module.exports = MakePancakesCommand;