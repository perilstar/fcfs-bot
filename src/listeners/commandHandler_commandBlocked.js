const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
  constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked'
    });
  }

  exec(message, command, reason) {
    if (reason == 'userPermissions') {
      message.channel.send('Not enough permissions!');
    }

    if (reason == 'guild') {
      message.channel.send('You can only use this command in a guild!');
    }
  }
}

module.exports = CommandBlockedListener;