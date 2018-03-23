import express from "express";
import { gameManager } from "./gameServer/GameManager.js";
import { mapManager } from "./gameServer/MapManager.js";
import api from "./api";

let router = express.Router();

// server the home page
let pkg = require("../package.json");
router.get("/", (req, res) => {
	res.render("index", {
		pkg,
		req,
		res
	});
});

// set up the status report
router.get("/health", (req, res) => {
	res.status(200).end("everything is running ok");
});

// serve api
router.use("/api", api);

// check the password and max players before the player joins
router.use("/play/:gameID", (req, res, next) => {
	let game = gameManager.getGame(req.params.gameID);
	if (game) {
		if (game.info.password && req.query.password != game.info.password)
			return res.redirect(`/join-game/${game.id}?error=incorect password`);

		if (game.players.players.length >= game.config.player.max)
			return res.redirect(`/join-game/${game.id}?error=this game has a limit of ${game.config.player.max} players`);
	} else return res.redirect(`/games?error=no room with id "${req.params.gameID}"`);

	next();
});

// serve pages
router.get("/games", (req, res) => {
	res.render("games", {
		pkg,
		req,
		res,
		maps: mapManager.maps,
		games: gameManager.games.sort((a, b) => {
			if (a.players.length > b.players.length) return -1;
			else if (a.players.length < b.players.length) return 1;
			else return 0;
		})
	});
});
router.get("/create-game", (req, res) => {
	res.render("create-game", {
		pkg,
		req,
		res,
		maps: mapManager.maps
	});
});
router.get("/join-game", (req, res) => {
	let game = gameManager.games[Math.floor(Math.random() * gameManager.games.length)];
	if (game) res.redirect("/play/" + game.id);
	else res.redirect("/games");
});
router.get("/join-game/:gameID", (req, res) => {
	let game = gameManager.getGame(req.params.gameID);
	if (!game) res.redirect("/games");

	// update the games last active
	game.info.lastActive = new Date();

	// render the join page
	res.render("join-game", {
		pkg,
		req,
		res,
		game,
		map: mapManager.getMap(game.info.map)
	});
});

export { router as default };
