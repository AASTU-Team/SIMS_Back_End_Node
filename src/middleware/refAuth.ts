import { Request, Response, NextFunction } from "express";
import Auth from "../models/auth.model";
import jwt from "jsonwebtoken";

const refAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log("req", req.body);
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded: any = jwt.verify(token, process.env.JWT_RT_SECRET as string);

    const user = await Auth.findOne({
      _id: decoded._id,
      tokens: { $in: [token] },
    });
    console.log(user);
    if (!user) {
      throw new Error("doesnt exist!");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "unAuthorized" });
  }
};

export { refAuth };
