import { Router } from "express";
import {
  register,
  login,
  getUserProfile,
  getNewAccessToken,
  changePassword,
} from "./auth.controller";
import { accessAuth } from "../../middleware/auth";
import { role } from "../../middleware/role";
import { refAuth } from "../../middleware/refAuth";
import { inviteAuth } from "../../middleware/inviteAuth";

const auth = Router();

auth.post("/register", register);
auth.post("/login", login);
auth.get("/me", [accessAuth, role], getUserProfile);
auth.post("/refresh", [refAuth], getNewAccessToken);
auth.patch("/password", accessAuth, changePassword);
auth.patch("/invitePass", inviteAuth, changePassword);

export default auth;
