const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');

class SetPrefixCommand extends Command {
  constructor() {
    super('setprefix', {
      aliases: ['setprefix', 'set-prefix', 'prefix'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: mps,
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