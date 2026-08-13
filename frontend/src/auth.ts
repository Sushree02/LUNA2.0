export const AUTH_SESSION_KEY = "luna_auth_session";
const USERS_KEY = "luna_users";
const LEGACY_KEYS = ["luna_favorites", "luna_playlists", "luna_last_played", "luna_playback_position", "luna_song_video_ids"];

export interface LunaUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  avatar?: string;
}

const loadUsers = (): LunaUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveUsers = (users: LunaUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const migrateLegacyData = (userId: string) => {
  LEGACY_KEYS.forEach((base) => {
    const legacy = localStorage.getItem(base);
    const target = `luna_${base.replace(/^luna_/, "")}_${userId}`;
    if (legacy && !localStorage.getItem(target)) localStorage.setItem(target, legacy);
  });
};

const hashPassword = async (password: string) => {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const getSession = (): LunaUser | null => {
  try {
    const email = localStorage.getItem(AUTH_SESSION_KEY);
    if (!email) return null;
    return loadUsers().find((user) => user.email === email) || null;
  } catch {
    return null;
  }
};

export const signUp = async (name: string, email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const user: LunaUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(AUTH_SESSION_KEY, user.email);
  migrateLegacyData(user.id);
  return user;
};

export const signIn = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = loadUsers().find((item) => item.email === normalizedEmail);
  if (!user || user.passwordHash !== await hashPassword(password)) {
    throw new Error("Invalid email or password.");
  }
  localStorage.setItem(AUTH_SESSION_KEY, user.email);
  migrateLegacyData(user.id);
  return user;
};

export const updateProfile = (updates: { name?: string; avatar?: string }) => {
  const session = getSession();
  if (!session) throw new Error("You are not signed in.");

  const users = loadUsers();
  const index = users.findIndex((user) => user.id === session.id);
  if (index < 0) throw new Error("Account not found.");

  const next = {
    ...users[index],
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
  };

  users[index] = next;
  saveUsers(users);
  return next;
};

export const signOut = () => localStorage.removeItem(AUTH_SESSION_KEY);
