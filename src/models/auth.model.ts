import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  HydratedDocument,
} from "mongoose";

import jwt from "jsonwebtoken";
const Joi = require("joi");

// Define the interface for the document
interface IAuth {
  username: string;
  password: string;
  email: string;
  tokens: string[];
  salt: string;
  invitations: string;
}

// interface FindByCredentials extends Model<IAuth> {
//   findByCredentials(email: string, password: string): Promise<IAuth | null>;
// }
interface IAuthMethods {
  generateAuthTokens(): Promise<{}>;
  generateNewAuthToken(): Promise<{}>;
}
// interface AuthModel extends Model<IAuth, {}, IAuthMethods> {
//   findByCredentials(
//     email: string,
//     password: string
//   ): Promise<HydratedDocument<IAuth, IAuthMethods>>;
// }
type AuthModel = Model<IAuth, {}, IAuthMethods>;

// Define the schema
const AuthSchema: Schema = new Schema<IAuth, AuthModel, IAuthMethods>({
  username: { type: String, required: true, min: 5, max: 40 },
  password: { type: String, required: true, min: 5, max: 1024 },
  email: { type: String, required: true, unique: true, min: 5, max: 255 },
  tokens: { type: [String], default: [] },
  salt: { type: String, required: true },
  invitations: { type: String },
});
function validateUser(user: Document) {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(40).required(),

    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });
  return schema.validate(user);
}
function validateAuth(user: Document) {
  const schema = Joi.object({
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });
  return schema.validate(user);
}
// Create and export the model
AuthSchema.method("generateAuthTokens", async function generateAuthTokens() {
  const id: Types.ObjectId = this._id as Types.ObjectId;
  const accessTokenPromise = jwt.sign(
    { _id: id.toString() },
    process.env.JWT_AT_SECRET as string,
    { expiresIn: "1h" }
  );
  const refreshTokenPromise = jwt.sign(
    { _id: id.toString() },
    process.env.JWT_RT_SECRET as string,
    { expiresIn: "7d" }
  );
  const [accessToken, refreshToken] = await Promise.all([
    accessTokenPromise,
    refreshTokenPromise,
  ]);
  //replace with the hashed one
  const tokens = this.tokens as [string];
  tokens.push(refreshToken);
  this.tokens = tokens;
  // this.tokens = this.tokens.concat({ refreshToken });
  await this.save();
  return { accessToken, refreshToken };
});

AuthSchema.method(
  "generateNewAuthToken",
  async function generateNewAuthToken() {
    const id: Types.ObjectId = this._id as Types.ObjectId;
    const accessTokenPromise = jwt.sign(
      { _id: id.toString() },
      process.env.JWT_AT_SECRET as string,
      { expiresIn: "1h" }
    );
    const [accessToken] = await Promise.all([accessTokenPromise]);
    return { accessToken };
  }
);

AuthSchema.statics.findByCredentials = async (
  email: string,
  password: string
): Promise<IAuth | null> => {
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
};
AuthSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log("changePassword");
    // this.password = await bcrypt.hash(this.password , 8)
  }
  next();
});

const Auth = mongoose.model<IAuth, AuthModel>("Auth", AuthSchema);
export default Auth;

async function createUser(user: IAuth): Promise<any> {
  const userResult = new Auth(user);
  const invitations = jwt.sign(
    { _id: userResult._id, email: userResult.email },
    process.env.JWT_IT_SECRET as string,
    { expiresIn: "7d" }
  );
  userResult.invitations = invitations;
  try {
    await userResult.save();
    return {
      email: userResult.email,
      invitations,
      username: userResult.username,
    };
  } catch (error: unknown) {
    return (error as Error).message;
  }
}

export { validateUser, createUser, validateAuth };
