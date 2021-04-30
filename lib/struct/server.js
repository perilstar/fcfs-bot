"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const channel_monitor_1 = __importDefault(require("./channel_monitor"));
class Server {
    constructor(client, id, prefix, adminRoles, modRoles, helperRoles) {
        this.client = client;
        this.id = id;
        this.prefix = prefix;
        this.channelMonitors = {};
        this.adminRoles = adminRoles;
        this.modRoles = modRoles;
        this.helperRoles = helperRoles;
    }
    addChannelMonitor(data) {
        const channelMonitor = new channel_monitor_1.default(this.client, data);
        this.channelMonitors[data.id] = channelMonitor;
        return this.channelMonitors[data.id];
    }
    removeChannelMonitor(id) {
        delete this.channelMonitors[id];
    }
    initMonitors() {
        return __awaiter(this, void 0, void 0, function* () {
            const initMonitorTasks = Object.keys(this.channelMonitors).map((id) => {
                return this.channelMonitors[id].init();
            });
            yield Promise.all(initMonitorTasks);
        });
    }
}
exports.default = Server;
