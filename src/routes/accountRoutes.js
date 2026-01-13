import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import {
  createAccount,
  updateAccount,
  listAccounts,
  getAccountById,
} from "../controllers/accountController.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  authorize(PERMISSIONS.ACCOUNT_CREATE),
  createAccount
);

router.patch(
  "/:id",
  requireAuth,
  authorize(PERMISSIONS.ACCOUNT_UPDATE),
  updateAccount
);

router.get("/", requireAuth, authorize(PERMISSIONS.ACCOUNT_READ), listAccounts);

router.get(
  "/:id",
  requireAuth,
  authorize(PERMISSIONS.ACCOUNT_READ),
  getAccountById
);

// router.post(
//   "/",
//   requireAuth,
//   authorize(PERMISSIONS.ACCOUNT_CREATE),
//   createAccount
// );
// router.patch(
//   "/:id",
//   requireAuth,
//   authorize(PERMISSIONS.ACCOUNT_UPDATE),
//   updateAccount
// );

export default router;
