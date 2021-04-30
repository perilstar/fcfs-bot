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
const fcfsclient_1 = __importDefault(require("./fcfsclient"));
const client = new fcfsclient_1.default();
client.start();
function saveAndExit() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Saving...');
        try {
            yield client.dataSource.save();
            console.log('Data Saved.');
            process.exit(0);
        }
        catch (err) {
            console.error('ERROR! Exiting forcefully.');
            process.exit(1);
        }
    });
}
process.on('SIGINT', saveAndExit);
process.on('message', (msg) => {
    if (msg === 'shutdown')
        saveAndExit();
});
