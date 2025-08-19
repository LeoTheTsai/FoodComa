import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { clearAuthCookies, getRefreshFromReq, setAuthCookies, signAccessToken, signRefreshToken } from "../lib/auth.js";

export const Query = { me: async (_: unknown, __: any, ctx: any) => ctx.user };

export const Mutation = {
  register: async (_: unknown, { email, password, name }: any, ctx: any) => {
    const existing = await UserModel.findOne({ email });
    if (existing) throw new Error("Email already registered");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ email, name, passwordHash });
    const access = signAccessToken({ id: user.id, email: user.email, name: user.name });
    const refresh = signRefreshToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookies(ctx.res, access, refresh);
    return { user: { id: user.id, email: user.email, name: user.name } };
  },
  login: async (_: unknown, { email, password }: any, ctx: any) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");
    const access = signAccessToken({ id: user.id, email: user.email, name: user.name });
    const refresh = signRefreshToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookies(ctx.res, access, refresh);
    return { user: { id: user.id, email: user.email, name: user.name } };
  },
  logout: async (_: unknown, __: any, ctx: any) => { clearAuthCookies(ctx.res); return true; },
  refresh: async (_: unknown, __: any, ctx: any) => {
    const ref = getRefreshFromReq(ctx.req); if (!ref) return false;
    const access = signAccessToken({ id: ref.id, email: ref.email, name: ref.name });
    const refresh = signRefreshToken({ id: ref.id, email: ref.email, name: ref.name });
    setAuthCookies(ctx.res, access, refresh); return true;
  }
};
