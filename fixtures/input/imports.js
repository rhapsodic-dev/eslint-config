import { hostname } from 'node:os';
import { format, inspect } from 'node:util';
import {
  existsSync, readFileSync,
  writeFileSync,
} from 'node:fs';

console.log(hostname, format, inspect, existsSync, readFileSync, writeFileSync);
