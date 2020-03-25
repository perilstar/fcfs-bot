const { Command } = require('discord-akairo');

class PingAfkCommand extends Command {
  constructor() {
    super('pingafk', {
      aliases: ['pingafk', 'afk'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {

    let mention = message.mentions.users.first();
  
    if (mention == null) {
      return message.channel.send(`Error: Missing argument: \`mentionUser\`. Use fcfs!help for commands.`);
    }

    let mentionMessage = "Press thumbs up if you are not AFK";
    mention.send(mentionMessage).then(msg => {
      msg.react('👍');

      const filter = (reaction, user) => {
          return ['👍'].includes(reaction.emoji.name) && user.id === message.author.id;
      };

      msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '👍') {
              msg.reply('you are kept in the queue');
            }
        })
        .catch(collected => {
          //TODO - remove user from VC queue in text queue
          

          msg.reply('you didn\'t reacted with thumbs up, it means you are afk so you are removed from the queue.');
        });
    });

    

  }
}

module.exports = PingAfkCommand;