const { Command } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');

class SetPrefixCommand extends Command {
  constructor() {
    super('setprefix', {
      aliases: ['setprefix', 'set-prefix', 'prefix'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'prefix',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    if (!args.prefix) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`prefix\`. Use fcfs!help for commands.`);
    }
    
    server.prefix = args.prefix;
    
    this.client.dataSource.saveServer(message.guild.id);

    return sendmessage(message.channel, `Successfully changed prefix to ${args.prefix}`);
  }
}

module.exports = SetPrefixCommand;