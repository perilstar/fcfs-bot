const { Command, Flag } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

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
          type: (message, phrase) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            return phrase;
          },
          otherwise: (msg, { failure }) => apf(msg, 'prefix', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];
    
    server.prefix = args.prefix;
    
    this.client.dataSource.saveServer(message.guild.id);

    return sendmessage(message.channel, `Successfully changed prefix to ${args.prefix}`);
  }
}

module.exports = SetPrefixCommand;