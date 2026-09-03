import api from "@/lib/api-client";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: "candidate" | "employer";
  phone?: string;
}

export interface AuthResponse {
  status: boolean;
  message?: string;
  token?: string;
  user?: User;
  role?: string;
  requires_2fa?: boolean;
  temp_token?: string;
}

export const authService = {
  login: async (data: LoginPayload) => {
    const res = await api.post<AuthResponse>("/login", data);
    return res.data;
  },

  verify2fa: async (data: { temp_token: string; code: string }) => {
    const res = await api.post<AuthResponse>("/two-factor/verify-login", data);
    return res.data;
  },

  register: async (data: RegisterPayload) => {
    const res = await api.post<AuthResponse>("/register", data);
    return res.data;
  },

  logout: async () => {
    await api.post("/logout");
  },

  getUser: async () => {
    const res = await api.get("/user");
    return res.data.data ?? res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await api.post("/reset-password", data);
    return res.data;
  },

  verifyEmail: async (id: number, hash: string) => {
    const res = await api.get(`/email/verify/${id}/${hash}`);
    return res.data;
  },

  checkUsername: async (username: string) => {
    const res = await api.get("/check-username", { params: { username } });
    return res.data;
  },

  // 2FA Management
  get2faStatus: async () => {
    const res = await api.get("/two-factor/status");
    return res.data;
  },

  setup2faTotp: async () => {
    const res = await api.post("/two-factor/setup");
    return res.data;
  },

  confirm2faTotp: async (code: string) => {
    const res = await api.post("/two-factor/confirm", { code });
    return res.data;
  },

  send2faOtp: async (channel: "sms" | "email", phone?: string) => {
    const payload: Record<string, string> = { channel };
    if (channel === "sms" && phone) {
      payload.phone = phone;
    }
    const res = await api.post("/two-factor/send-otp", payload);
    return res.data;
  },

  confirm2faOtp: async (channel: "sms" | "email", code: string) => {
    const res = await api.post("/two-factor/confirm-otp", { channel, code });
    return res.data;
  },

  disable2fa: async (code: string) => {
    const res = await api.post("/two-factor/disable", { code });
    return res.data;
  },

  // Login OTP
  sendLoginOtp: async (tempToken: string) => {
    const res = await api.post("/two-factor/send-login-otp", { temp_token: tempToken });
    return res.data;
  },

  verifyLoginOtp: async (tempToken: string, code: string) => {
    const res = await api.post("/two-factor/verify-login-otp", { temp_token: tempToken, code });
    return res.data;
  },

  // Email OTP verification (post-registration)
  requestEmailOtp: async () => {
    const res = await api.post("/verifications/email/request");
    return res.data;
  },

  confirmEmailOtp: async (code: string) => {
    const res = await api.post("/verifications/email/confirm", { otp_code: code });
    return res.data;
  },
};