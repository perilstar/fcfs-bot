const { Listener } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class CommandBlockedListener extends Listener {
  constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked'
    });
  }

  exec(message, command, reason) {
    if (reason === 'guild') {
      return sendmessage(message.channel, 'You can only use this command in a guild!');
    }
  }
}

module.exports = CommandBlockedListener;