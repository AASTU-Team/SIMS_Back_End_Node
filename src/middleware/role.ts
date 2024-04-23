import { Request, Response, NextFunction } from "express";

const role = async (req: any, res: Response, next: NextFunction) => {
  console.log(req.user);
  if (req.user?.role === "admin") next();
  res.status(403).send({ error: "unAuthorized" });
};

export { role };
