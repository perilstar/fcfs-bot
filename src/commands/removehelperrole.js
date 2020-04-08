const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class RemoveHelperRoleCommand extends Command {
  constructor() {
    super('removehelperrole', {
      aliases: ['removehelperrole', 'remove-helperrole', 'rhr'],
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

    let helperRoles = server.helperRoles;

    if (!helperRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is not set as bot helper!`);
    }

    let index = server.helperRoles.indexOf(args.role.id);
    server.helperRoles.splice(index, 1);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully removed role ${args.role.name} as bot helper!`);
  }
}

module.exports = RemoveHelperRoleCommand;