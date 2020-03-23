const { VoiceChannel } = require('discord.js');

class MonitoredChannel {
  constructor(client, data) {
    this.client = client;

    this.guildID = data.guildID
    this.id = data.id;
    this.name = data.name;

    this.displayChannel = data.displayChannel;
    this.displayMessage = data.displayMessage;

    this.rejoinWindow = data.rejoinWindow;
    this.firstN = data.firstN;
    this.afkCheckDuration = data.afkCheckDuration;
    this.restrictedMode = data.restrictedMode;
    this.allowedRoles = data.allowedRoles;

    this.removalTimers = {};

    this.channel = this.client.channels.resolve(this.id);

    this.populateQueue(data.snowflakeQueue);

    this.updateDisplay();
  }

  setRestrictedMode(mode) {
    this.restrictedMode = mode;
    // save somehow
  }

  async populateQueue(snowflakeQueue) {
    // Get rid of users who aren't in the channel anymore
    snowflakeQueue = snowflakeQueue.filter(id => this.channel.members.get(id) !== undefined);

    // Get users from queue data
    await Promise.all(snowflakeQueue.map(snowflake => this.client.users.fetch(snowflake))).then(users => {
      this.queue = users;
    })

    // If there's users missing from the queue, add them in a random order
    if (this.queue.length < this.channel.members.size) {
      let currentlyConnected = this.channel.members;
      let rest = currentlyConnected.random(currentlyConnected.size).filter(id => !this.queue.includes(id));

      for (let user of rest) {
        this.queue.push(user);
      }
    }

    this.client.datasource.timeoutSaveMonitor(this.id);
  }

  get message() {
    let title = `**${this.name} Queue:**`;
    let top = this.queue.slice(0, this.firstN).map(user => `${user.username} (${user.tag})`).join('\n');

    return title + "\n```\n" + top + "\n```";
  }

  addUserToQueue(user) {
    if (this.removalTimers[user.id]) {
      clearTimeout(this.removalTimers[user.id]);
      delete this.removalTimers[user.id];
    } else {
      this.queue.push(this.client.users.resolve(user));
      this.timeoutUpdateDisplay();
      this.client.datasource.timeoutSaveMonitor(this.id);
    }
  }

  timeoutRemoveUserFromQueue(user) {
    setTimeout(() => this.removeUserFromQueue(user), this.rejoinWindow)
  }

  removeUserFromQueue(user) {
    let removeIndex = this.queue.findIndex(el => el.id == user.id)
    this.queue.splice(removeIndex, 1);
    this.timeoutUpdateDisplay();
    this.client.datasource.timeoutSaveMonitor(this.id);
  }

  timeoutUpdateDisplay() {
    if (this.updateTimer) return;
    this.updateTimer = setTimeout(() => this.updateDisplay(), 1500);
  }

  updateDisplay() {
    this.updateTimer = null;
    this.client.channels.resolve(this.displayChannel).messages.fetch(this.displayMessage).then(message => {
      message.edit(this.message);
    });
  }
}

module.exports = MonitoredChannel;