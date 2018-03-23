import { Game } from "lazer-game-core";
import * as messageTypes from "../messageTypes";

export default class PlayerController {
	constructor(player) {
		this.player = player;

		this.disposeHandlers = [];
	}

	_onSocketEvent(event, listener) {
		if (!this.socket) return this;
		this.socket.on(event, listener);
		// dont add a dispose handler for the sockets events, it dose not support removing event listeners
		// this.disposeHandlers.push(() => this.socket.off(event, listener));
		return this;
	}
	_onEvent(emitter, event, listener) {
		if (!this.socket) return this;
		emitter.on(event, listener);
		this.disposeHandlers.push(() => emitter.off(event, listener));
		return this;
	}

	attach(socket) {
		this.socket = socket;

		this._onSocketEvent(messageTypes.UPDATE_CONTROLS, data => {
			this.player.setControl(data);
		});

		// player events
		this._onEvent(this.player.manager, "player-info-changed", player => {
			this.socket.emit(messageTypes.PLAYER_INFO_CHANGED, {
				id: player.id,
				info: player.info
			});
		});
		this._onEvent(this.player.manager, "player-props-changed", player => {
			this.socket.emit(messageTypes.PLAYER_PROPS_CHANGED, {
				id: player.id,
				props: player.props
			});
		});

		// update the clients players every 2 steps
		const sendEvery = Game.DEFAULT_FPS * 2;
		let timer = 0;
		let lastPositions = {};
		this._onEvent(this.player.game, "update", delta => {
			timer += delta;
			if (timer > sendEvery) {
				timer = 0;

				// build positions
				let positions = {};
				this.player.manager.players
					.filter(player => {
						let lastPosition = lastPositions[player.id];
						return (
							!lastPosition ||
							lastPosition[0] !== player.position.x ||
							lastPosition[1] !== player.position.y ||
							lastPosition[2] !== player.position.vx ||
							lastPosition[3] !== player.position.vy ||
							lastPosition[4] !== player.controls.direction
						);
					})
					.forEach(player => {
						positions[player.id] = [
							player.position.x,
							player.position.y,
							player.position.vx,
							player.position.vy,
							player.controls.direction
						];
					});

				// send all position info
				if (Reflect.ownKeys(positions).length) this.socket.emit(messageTypes.PLAYER_POSITIONS, positions);

				// update cache
				Object.assign(lastPositions, positions);
			}
		});
		this._onEvent(this.player.manager, "player-created", player => {
			this.socket.emit(messageTypes.PLAYER_CREATED, {
				id: player.id,
				data: player.toJSON()
			});
		});
		this._onEvent(this.player.manager, "player-removed", player => {
			this.socket.emit(messageTypes.PLAYER_REMOVED, {
				id: player.id
			});
		});

		// bullet events
		this._onEvent(this.player.game.bullets, "bullet-created", bullet => {
			this.socket.emit(messageTypes.BULLET_CREATED, bullet.toJSON());
		});
		this._onEvent(this.player.game.bullets, "bullet-removed", bullet => {
			this.socket.emit(messageTypes.BULLET_REMOVED, { id: bullet.id });
		});
		this._onEvent(this.player.game.bullets, "bullet-props-changed", bullet => {
			this.socket.emit(messageTypes.BULLET_PROPS_CHANGED, {
				id: bullet.id,
				props: bullet.props
			});
		});

		// respond to ping events
		this._onSocketEvent("__ping__", (data, cb) => cb("pong"));

		return this;
	}

	detach() {
		this.dispose();
		this.socket = undefined;
		return this;
	}

	dispose() {
		this.disposeHandlers.forEach(fn => fn());
		this.disposeHandlers = [];
		return this;
	}
}
