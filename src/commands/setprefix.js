const { Command } = require('discord-akairo');

class SetPrefixCommand extends Command {
  constructor() {
    super('setprefix', {
      aliases: ['setprefix'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'prefix',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!args.prefix) {
      return message.channel.send(`Error: Missing argument: \`prefix\`. Use fcfs!help for commands.`);
    }
    
    server.prefix = args.prefix;
    
    this.client.datasource.saveServer(message.guild.id);

    return message.channel.send('Success!');
  }
}

module.exports = SetPrefixCommand;