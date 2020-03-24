const { Command } = require('discord-akairo');

class MakePancakesCommand extends Command {
  constructor() {
    super('makepancakes', {
      aliases: ['makepancakes', 'pancakes'],
      split: 'quoted',
      channel: 'dm'
    });
  }

  async exec(message, args) {
    message.channel.send('🥞');
  }
}

module.exports = MakePancakesCommand;