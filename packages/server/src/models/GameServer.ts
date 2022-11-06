import http from 'http';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_STATE_UPDATE,
  PING,
  PlayerAction,
  PLAYER_ACTION,
  EntityOrientation,
  JOIN_GAME,
  BOTS_COUNT
} from '@game/shared-domain';
import { GameWorld } from '../models/GameWorld';
import { isPlayer } from '../utils';
import { Player } from '../models/Player';
import { createPlayer } from '../factories/player';
import { PORT } from '../constants';
import { v4 as uuid } from 'uuid';
import randomNames from 'random-name';

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(private server: http.Server, private world: GameWorld) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupWorldListener();
    this.setupIoListener();
    this.addBots();
  }

  private setupWorldListener() {
    this.world.on('update', state => {
      const players = [...state.entities.values()].filter(isPlayer);
      players.forEach(player => {
        const socket = this.io.sockets.sockets.get(player.id);

        if (!socket) {
          // player.destroy();
          return;
        }

        socket.emit(GAME_STATE_UPDATE, {
          playerCount: players.length,
          entities: player.visibleEntities.map(entity => entity.toDto()),
          discoveredCells: player.consumeDiscoveredCells()
        });
      });
    });
  }

  private setupIoListener() {
    this.io.on('connection', socket => {
      socket.on('disconnect', () => {
        this.world.getEntity(socket.id)?.destroy();
      });

      socket.on(PING, (timestamp, callback) => {
        callback(timestamp);
      });

      socket.on(JOIN_GAME, (payload, callback) => {
        this.world.addEntity(
          createPlayer({
            id: socket.id,
            world: this.world,
            meta: {
              name: payload.username,
              orientation: EntityOrientation.RIGHT,
              job: payload.job
            }
          })
        );

        callback();
      });

      socket.on(PLAYER_ACTION, action => {
        const player = this.world.getEntity<Player>(socket.id);
        if (!player) return;

        switch (action.type) {
          case PlayerAction.MOVE:
            return this.world.scheduleAction(() =>
              player.move(action.meta.directions)
            );
          case PlayerAction.FIRE_PROJECTILE:
            return this.world.scheduleAction(() =>
              player.fireProjectile(action.meta.target)
            );
        }
      });
    });
  }

  private addBots() {
    for (let i = 0; i < BOTS_COUNT; i++) {
      this.world.addEntity(
        createPlayer({
          id: uuid(),
          world: this.world,
          meta: {
            name: randomNames.first(),
            orientation: EntityOrientation.RIGHT,
            job: 'ROGUE'
          }
        })
      );
    }
  }

  start(cb: (port: string | number) => void) {
    this.world.start();
    this.server.listen(PORT, () => {
      cb(PORT);
    });
  }
}
