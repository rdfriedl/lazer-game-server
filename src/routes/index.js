import { Router } from "express";
import pkg from "../../package.json";

import gamesRoutes from "./games";
import gameRoutes from "./game";

const router = new Router();

router.use((req, res, next) => {
	Object.assign(res.locals, {
		pkg,

		// TODO: remove once views are cleaned up
		req,
		res
	});

	next();
});

router.use("/games", gamesRoutes);
router.use("/game", gameRoutes);

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/health", (req, res) => {
	res.status(200).end("everything is running ok");
});

export default router;
