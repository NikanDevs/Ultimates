"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require('dotenv').config();
const Client_1 = require("./structures/Client");
exports.client = new Client_1.Ultimates();
exports.client.born();
