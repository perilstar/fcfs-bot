const { Command } = require('discord-akairo');
const { TextChannel } = require('discord.js');
const sendmessage = require('../util/sendmessage');
const Constants = require('../util/constants');

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'about', 'commands'],
      args: [
        {
          id: 'page',
          type: 'uppercase'
        }
      ]
    });
  }

  async exec(message, args) {
    const pages = Constants.HelpPages;

    let page = args.page ? args.page : 'DEFAULT';

    if (!pages[page]) {
      return sendmessage(message.channel, 'Unknown page!');
    }

    let content = `**First Come, First Serve**\n*Default prefix:* \`fcfs!\`\n\n` + pages[page].trim().split('\n').map(line => line.trim()).join('\n');
    if (page === 'DEFAULT') {
      content += `\n\n\`v${this.client.version} by perilstar with help from StKWarrior\``;
    }

    let dmChannel = message.author.dmChannel;

    if (!dmChannel) {
      dmChannel = await message.author.createDM();
    }

    if (message.channel instanceof TextChannel) {
      sendmessage(message.channel, 'Sending you a DM with the help message!');
    }
    return sendmessage(dmChannel, content);
  }
}

module.exports = HelpCommand;