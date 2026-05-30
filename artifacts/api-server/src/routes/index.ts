import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import usersRouter from "./users";
import propertiesRouter from "./properties";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(usersRouter);
router.use(propertiesRouter);
router.use(storageRouter);

export default router;
