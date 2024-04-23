import { Request, Response } from "express";
import {
  createUser,
  validateAuth,
  validateUser,
} from "../../models/auth.model";
import Auth from "../../models/auth.model";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../helper/mail";
interface IAuth {
  username: string;
  password: string;
  email: string;
  tokens: string[];
  salt: string;
}

async function register(req: Request, res: Response): Promise<any> {
  //  Validate user data
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // const selected = ..._.pick(, [
  //   "username",
  //   "email",
  //   "password",
  //   "salt",
  // ]);
  const user = await createUser({ ...req.body, salt: "213456" });
  //send email with link
  await sendEmail(user);
  console.log(user);
  if (!user) return res.status(409).json("Conflict");
  return res.status(201).send({ success: "success message" });
}
async function login(req: Request, res: Response): Promise<any> {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // Handle login logic here
  try {
    const user = await findByCredentials(req.body.email, req.body.password);
    // res.status(200).send(user);
    const tokens = await user.generateAuthTokens();
    res.send({ ...tokens });
  } catch (e: unknown) {
    console.log(e);
    res.status(400).send(e);
  }
}
async function getUserProfile(req: any, res: Response) {
  try {
    res.status(200).send("user profile");
  } catch (e) {
    // res.status(500).send(error.message)
  }
}
async function getNewAccessToken(req: any, res: Response): Promise<void> {
  try {
    const user = req.user;
    const tokens = await user.generateAuthTokens();
    res.send({ ...tokens });
  } catch (e: unknown) {
    console.log(e);
    res.status(400).send(e);
  }
}
async function changePassword(req: any, res: Response): Promise<void> {
  try {
    const user = req.user;
    //password vaildation
    // hashed bfr save check check the model
    //compare old pass
    console.log(req.body);
    user.password = req.body.password;
    if (req.isFirstTime) user.invitations = "";
    console.log(user);
    await user.save();
    res.status(200).send("password changed");
  } catch (e: unknown) {
    console.log(e);
    res.status(400).send(e);
  }
}

async function findByCredentials(
  email: string,
  password: string
): Promise<any> {
  const user = await Auth.findOne({
    email: email,
  });
  if (!user) {
    throw new Error("invalid email or password");
  }
  // const isMatch = await bcrypt.compare(password , user.password)
  if (password !== user.password) {
    throw new Error(" invalid email or password");
  }
  return user;
}

export { register, login, getUserProfile, getNewAccessToken, changePassword };
