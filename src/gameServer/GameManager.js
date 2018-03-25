import { Emitter } from "regexp-events";
import { Game } from "lazer-game-core";
import { mapManager } from "./MapManager";

export default class GameManager extends Emitter {
	constructor() {
		super();

		this.games = [];

		// start update loop
		setInterval(() => {
			this.games.forEach(g => g.update());
		}, Game.DEFAULT_FPS);
	}

	static get inst() {
		return this._inst || (this._inst = new this());
	}

	getGame(id) {
		if (id instanceof Game) return this.games.includes(id) ? id : undefined;
		else return this.games.find(game => game.id === id);
	}

	createGame(data = {}) {
		let game = new Game();

		game.isMaster = true;
		if (data.maxPlayers > 0) {
			game.config.player.max = data.maxPlayers;
		}

		Object.assign(game.info, {
			name: data.name,
			tagline: data.tagline || "",
			description: data.description || "",
			private: data.private || false
		});

		let mapId = data.mapId || mapManager.maps[Math.floor(Math.random() * mapManager.maps.length)].id;
		if (!mapManager.hasMap(mapId)) {
			throw new Error("No map with id: " + mapId);
		}
		game.info.map = mapId;
		game.map.fromJSON(mapManager.getMap(mapId).json);

		this.games.push(game);
		this.emit("game-created", game);
		return game;
	}

	removeGame(id) {
		let game = this.getGame(id);
		if (game) {
			game.players.clearPlayers();
			this.games.splice(this.games.indexOf(game), 1);
			this.emit("game-removed", game);
		}
		return this;
	}

	clearGames() {
		this.games.forEach(this.removeGame.bind(this));
		this.emit("games-cleared");

		return this;
	}

	/**
	 * removes unused games
	 * @return {this}
	 */
	cleanGames() {
		this.games.filter(game => game.players.players.length == 0).forEach(this.removeGame.bind(this));

		return this;
	}
}

let gameManager = GameManager.inst;
export { gameManager, GameManager };
