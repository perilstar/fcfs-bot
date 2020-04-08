const AFKChecker = require('./afk_checker');
const sendmessage = require('../util/sendmessage');

class AFKCheckScheduler {
  constructor(client, channelMonitor, interval) {
    this.client = client;
    this.channelMonitor = channelMonitor;
    this.interval = interval;
  }

  async run() {
    try {
      let guild = this.client.guilds.resolve(this.channelMonitor.guildID);
      let server = this.client.dataSource.servers[guild.id];
      let outputChannel = guild.channels.resolve(this.channelMonitor.autoOutput);
      
      if (!this.channelMonitor.queue.length) return;

      const update = (message, data) => {
        let text = `Auto AFK-checking...\n\n`;
        if (data.recentlyChecked) text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
        if (data.notInVC) text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
        if (data.notAFK) text += `${data.notAFK} member(s) reacted to the message in time\n`;
        if (data.afk) text += `${data.afk} member(s) were booted from the queue\n`;

        message.edit(text).catch(() => {});
      };

      const finalize = (message, data) => {
        let text = `Auto AFK-checking complete!\n\n`;
        if (data.recentlyChecked) text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
        if (data.notInVC) text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
        if (data.notAFK) text += `${data.notAFK} member(s) reacted to the message in time\n`;
        if (data.afk) text += `${data.afk} member(s) were booted from the queue\n`;

        message.edit(text).catch(() => {});
      };

      let resultsMessage = await sendmessage(outputChannel, 'Auto AFK-checking...');

      let top = this.channelMonitor.queue.slice(0, this.channelMonitor.displaySize).map(user => guild.members.cache.get(user.id));

      let afkChecker = new AFKChecker(this.client, server, this.channelMonitor, top);

      afkChecker.on('update', (data) => {
        update(resultsMessage, data);
      });

      let results = await afkChecker.run();
      finalize(resultsMessage, results);
      afkChecker.removeAllListeners('update');
    } catch (err) {
      console.error(err);
    }
  }

  start() {
    if (this.startTimeout) clearTimeout(this.startTimeout);
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.interval === -1) return;
    let timeUntilNext = this.interval - (Date.now() % this.interval);
    this.startTimeout = setTimeout(() => {
      this.run();
      this.intervalTimer = setInterval(() => {
        this.run();
      }, this.interval);
    }, timeUntilNext);

    return timeUntilNext;
  }

  changeInterval(interval) {
    this.interval = interval;
    return this.start();
  }
}

module.exports = AFKCheckScheduler;