import { Router } from "express";
import { mapManager } from "../gameServer/MapManager";
import { gameManager } from "../gameServer/GameManager";
import namor from "namor";

const router = new Router();

router.use((req, res, next) => {
	Object.assign(res.locals, {
		maps: mapManager.maps,
		games: gameManager.games
			.filter(game => !game.private)
			.sort((a, b) => Math.sign(b.players.players.length - a.players.players.length))
	});

	next();
});

router.get("/", (req, res) => {
	res.render("games/index");
});

router.all("/quick-join", (req, res) => {
	let gameList = res.locals.games;

	let game = gameList.find(game => game.players.players.length < game.config.player.max);
	if (!game) game = gameManager.createGame();

	res.redirect(`/game/${game.id}/play`);
});

router.get("/create", (req, res) => {
	res.render("games/create", {
		defaultName: namor.generate()
	});
});
router.post("/create", (req, res) => {
	let game = gameManager.createGame({
		name: req.body.name,
		tagline: req.body.tagline,
		description: req.body.description,
		mapId: req.body.map,
		private: req.body.private === "on",
		maxPlayers: parseInt(req.body.maxPlayers) || game.config.player.max
	});

	res.redirect(`/game/${game.id}`);
});

export default router;
