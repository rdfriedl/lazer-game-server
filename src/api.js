import express from "express";
import { gameManager } from "./gameServer/GameManager.js";
import { mapManager } from "./gameServer/MapManager.js";
import { generate as shortID } from "shortid";
import escapeHTML from "escape-html";
import cors from "cors";
import bodyParser from "body-parser";

let router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

router.get("/games", (req, res) => {
	res.json(
		gameManager.games.map(game => ({
			id: game.id,
			info: game.info,
			config: game.config,
			players: game.players.map(player => ({
				id: player.id,
				info: player.info
			}))
		}))
	);
});
router.use("/game/:gameID", (req, res, next) => {
	let game = gameManager.getGame(req.params.gameID);
	if (!game)
		res
			.status(400)
			.json({
				error: true,
				message: "no game with id " + req.params.gameID
			})
			.end();
	else next();
});
router.get("/game/:gameID", (req, res) => {
	let game = gameManager.getGame(req.params.gameID);
	res.status(200).json({
		id: game.id,
		info: game.info,
		config: game.config,
		players: game.players.map(player => ({
			id: player.id,
			info: player.info
		}))
	});
});
router.get("/create-game", (req, res) => {
	let q = req.query;

	// make sure we have the map
	if (!q.map) q.map = mapManager.maps[Math.floor(Math.random() * mapManager.maps.length)].id;
	if (q.map && !mapManager.hasMap(q.map)) return res.redirect(`/create-game?error=No map with id ${q.map}`);

	let id = shortID();
	let game = gameManager.createGame(id);

	if (q.name) game.info.name = escapeHTML(q.name);
	if (q.tagline) game.info.tagline = escapeHTML(q.tagline);
	if (q.description) game.info.description = escapeHTML(q.description);
	if (q.password) game.info.password = q.password;
	if (q.private === "on") game.info.private = true;

	if (!isNaN(q.maxPlayers)) game.config.player.max = parseInt(q.maxPlayers) || game.config.player.max;

	// load the games map
	game.info.map = q.map;
	game.map.fromJSON(mapManager.getMap(q.map).json);

	res.redirect("/join-game/" + game.id);
});

// server maps
router.use("/map/:mapID", (req, res, next) => {
	if (!mapManager.hasMap(req.params.mapID)) return res.status(400).end(`no map with ID "${req.params.mapID}"`);

	next();
});
router.get("/map/:mapID", (req, res) => {
	res.json(mapManager.getMap(req.params.mapID).json);
});
router.get("/map/:mapID/thumbnail", (req, res) => {
	res.sendFile(mapManager.getMap(req.params.mapID).thumbnail);
});

export { router as default };
