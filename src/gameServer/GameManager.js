import { Emitter } from "regexp-events";
import { Game } from "lazer-game-core";
import { generate as shortID } from "shortid";

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
		else return this.games.find(game => game.id == id);
	}

	createGame(id = shortID()) {
		if (this.getGame(id)) return;
		let game = new Game(id);
		game.isMaster = true;
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
