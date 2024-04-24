import { Request, Response, NextFunction } from "express";
import Auth from "../models/auth.model";
import jwt from "jsonwebtoken";
import { func } from "joi";

const refAuth = async (req: any, res: Response, next: NextFunction) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_RT_SECRET as string);

    const user = await getUser(decoded, token);
    //Auth.findOne({
    //   _id: decoded._id,
    //   tokens: { $in: [token] },
    // });
    console.log(user);
    if (!user) {
      throw new Error("doesnt exist!");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e: any) {
    if (e.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      console.log(decoded);
      const updated = await getUser(decoded, token);
      console.log(updated);
      if (updated) {
        updated.tokens = updated.tokens.filter((t: string) => t !== token);
        updated.save();
      }
      // Auth.findOneAndUpdate(
      //   { _id: decoded?._id },
      //   { $pull: { tokens: { token: token } } },
      //   { new: true }
      // );
    }
    console.log(e.message);
    return res.status(401).send({ error: "unAuthorized" });
  }
};
async function getUser(decoded: any, token: string): Promise<any> {
  console.log(decoded._id, token);
  const user = await Auth.findOne({
    _id: decoded._id,
    tokens: { $in: [token] },
  });

  return user;
}

export { refAuth };
