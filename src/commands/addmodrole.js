const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class AddModRoleCommand extends Command {
  constructor() {
    super('addmodrole', {
      aliases: ['addmodrole', 'add-modrole', 'amr'],
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

    if (modRoles.length >= 10) {
      return sendmessage(message.channel, `Error: You can not add more than 10 roles as bot mod!`);
    }

    if (modRoles.includes(args.role.id)) {
      return sendmessage(message.channel, `Error: ${args.role.name} is already set as bot mod!`);
    }

    server.modRoles.push(args.role.id);
    ds.saveServer(server.id);

    return sendmessage(message.channel, `Successfully added role ${args.role.name} as a bot mod!`);
  }
}

module.exports = AddModRoleCommand;