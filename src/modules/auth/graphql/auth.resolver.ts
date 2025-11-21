/*
 * IMPORT
 */
import jwt from "jsonwebtoken";
import { SignupSchema, LoginSchema } from "../validation/auth.validation";
import SignupUser from "../services/signupUser";
import LoginUser from "../services/loginUser";
import LogoutUser from "../services/logoutUser";
import RefreshToken from "../services/refreshToken";

/*
 * FUNCTION
 */
const _AuthResolvers = {
  Mutation: {
    SignUpUser: async (_: any, args: any) => {
      const input = SignupSchema.parse(args);
      return SignupUser(input.email, input.password, input.name);
    },

    LoginUser: async (_: any, args: any) => {
      const input = LoginSchema.parse(args);
      return LoginUser(input.email, input.password);
    },

    LogoutUser: async (_: any, { token }: any) => {
      const decoded = jwt.decode(token) as any;
      return LogoutUser(decoded.id, token, decoded.exp);
    },

    RefreshToken: async (_: any, { userId, token }: any) => {
      return RefreshToken(userId, token);
    },
  },
};

/*
 * EXPORT
 */
export default _AuthResolvers;
