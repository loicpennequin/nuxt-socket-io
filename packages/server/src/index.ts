import { Constructor } from '@game/shared-utils';
import express from 'express';
import http from 'http';
import { createGameMap } from './factories/gameMap';
import { createGameServer } from './factories/gameServer';
import { createGameWorld } from './factories/gameWorld';

const app = express();
const server = http.createServer(app);
const world = createGameWorld({ map: createGameMap() });
const gameServer = createGameServer(server, world);

gameServer.start(port => console.log(`listening on port ${port}`));
