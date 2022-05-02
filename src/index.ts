require('dotenv').config();
import { nikansUtil } from './structures/Client';

export const client = new nikansUtil();

client.born();
