const ChannelMonitor = require('./channel_monitor');

class Server {
  constructor(client, id, prefix, adminRoles) {
    this.client = client;
    this.id = id;
    this.prefix = prefix;

    this.channelMonitors = {};
    this.adminRoles = adminRoles;
  }

  addChannelMonitor(data) {
    let channelMonitor = new ChannelMonitor(this.client, data);
    return this.channelMonitors[data.id] = channelMonitor;
  }

  removeChannelMonitor(id) {
    delete this.channelMonitors[id];
  }

  async initMonitors() {
    for (let id in this.channelMonitors) {
      await this.channelMonitors[id].init();
    }
  }
}

module.exports = Server;