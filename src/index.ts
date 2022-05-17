require('dotenv').config();
import { Ultimates } from './structures/Client';

export const client = new Ultimates();

client.born();
