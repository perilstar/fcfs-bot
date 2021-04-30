"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function apf(message, arg, failure) {
    let msg = '';
    if (!failure)
        return 'An unkown internal error occured! Please report this to peril#1024.';
    switch (failure.value.reason) {
        case 'missingArg':
            msg = `Error: Missing or incorrect argument: ${arg}. Use fcfs!help for commands.`;
            break;
        case 'outOfRange':
            msg = `Error: ${arg} must be between ${failure.value.min} and ${failure.value.max}!`;
            break;
        case 'notARole':
            msg = `Error: Couldn't find a role matching ${failure.value.phrase}!`;
            break;
        case 'notATextChannel':
            msg = `Error: Couldn't find a text channel matching ${failure.value.phrase}!`;
            break;
        case 'notAVoiceChannel':
            msg = `Error: Couldn't find a voice channel matching ${failure.value.phrase}!`;
            break;
        case 'channelNotMonitored':
            msg = `Error: Channel ${failure.value.voiceChannel.name} is not being montiored!`;
            break;
        case 'invalidInterval':
            msg = `Error: ${arg} must be either 'off' or between ${failure.value.min} and ${failure.value.max}!`;
            break;
        case 'notAMember':
            msg = `Error: Couldn't find a member matching ${failure.value.phrase}!`;
            break;
        case 'memberNotInVoice':
            msg = `Error: Member ${failure.value.member.user.tag} is not in a voice channel!`;
            break;
        case 'memberNotInMonitoredChannel':
            msg = `Error: Member ${failure.value.member.user.tag} is not in a monitored voice channel!`;
            break;
        case 'notANumber':
            msg = `Error: ${failure.value.phrase} is not a number!`;
            break;
        default:
            console.log(`Unknown Error on arg parse: ${message}, ${arg}, ${JSON.stringify(failure)}`);
            msg = 'An unknown internal error ocurred! Please report this to peril#1024.';
    }
    return discord_js_1.Util.removeMentions(msg);
}
exports.default = apf;
