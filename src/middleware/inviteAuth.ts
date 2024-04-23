import { Request, Response, NextFunction } from "express";
import Auth from "../models/auth.model";
import jwt from "jsonwebtoken";

const inviteAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log("req", req.body, req.header("Authorization"));
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded: any = jwt.verify(token, process.env.JWT_IT_SECRET as string);

    const user = await Auth.findOne({
      email: decoded.email,
      invitations: token,
    });

    console.log(user);
    if (!user) {
      throw new Error("doesnt exist!");
    }
    req.token = token;
    req.user = user;
    req.isFirstTime = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "unAuthorized" });
  }
};
export { inviteAuth };
