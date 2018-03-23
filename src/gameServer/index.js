import path from "path";
import fs from "fs";
import SocketIO from "socket.io";
import GameManager from "./GameManager.js";
import PlayerController from "./PlayerController.js";
import MapManager from "./MapManager.js";
import * as paths from "../paths";

// set up the socket server
let io = new SocketIO();
io.serveClient(false);

let playerControllers = {
	socket: new WeakMap(),
	player: new WeakMap()
};
io.on("connection", socket => {
	socket.on("join-game", function(data, callback) {
		let game = GameManager.inst.getGame(data.game);
		if (!game) return callback(null);

		let player = game.players.createPlayer(data.info);
		game.spawnPlayer(player);

		// create the controller
		let controller = new PlayerController(player).attach(socket);
		playerControllers.socket.set(socket, controller);
		playerControllers.player.set(player, controller);

		// tell the client its connected, and give it the players id
		callback({
			game: game.toJSON(),
			playerID: player.id
		});
	});

	socket.on("disconnect", () => {
		let controller = playerControllers.socket.get(socket);
		if (controller) {
			let player = controller.player;
			playerControllers.socket.delete(socket);
			playerControllers.player.delete(player);

			controller.detach();

			if (player.game) player.game.players.removePlayer(player);
		}
	});
});

// set up cron jobs
setInterval(() => {
	let now = new Date();
	let olderThan = now - 60 * 60 * 1000;
	GameManager.inst.games
		.filter(game => {
			if (game.players.players.length > 0) {
				game.info.lastActive = new Date();
				return false;
			} else {
				return game.info.lastActive ? game.info.lastActive < olderThan : true;
			}
		})
		.forEach(game => GameManager.inst.removeGame(game));
}, 10 * 60 * 1000);

// load all the maps
let isJSON = /\.json$/;
fs
	.readdirSync(path.resolve(paths.res, "maps/"))
	.filter(fileName => isJSON.test(fileName))
	.forEach(fileName => {
		let name = fileName.replace(/(^.*.\/|\..*$)/, "");
		MapManager.inst.addMap(
			name,
			path.resolve(paths.res, "maps/", fileName),
			path.resolve(paths.res, "maps/", fileName.replace(".json", ".png"))
		);
	});

// log events
GameManager.inst.on("game-removed", game => {
	console.log("removed game: " + game.id);
});
GameManager.inst.on("game-created", game => {
	console.log("created game: " + game.id);
});

// export
export { io as default };
