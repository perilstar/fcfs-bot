const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class RemoveModRoleCommand extends Command {
  constructor() {
    super('removemodrole', {
      aliases: ['removemodrole', 'remove-modrole', 'rmr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'role',
          type: 'role'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.role) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`role\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    let modRoles = server.modRoles;

    if (!modRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not set as bot mod!`);
    }

    let index = server.modRoles.indexOf(args.role.id);
    server.modRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully removed role ${args.role.name} as bot mod!`);
  }
}

module.exports = RemoveModRoleCommand;