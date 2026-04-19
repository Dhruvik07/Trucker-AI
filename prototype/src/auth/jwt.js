// Lightweight frontend JWT utility
// In production this would be verified server-side; for the demo we self-sign.

const SECRET = 'trucker-ai-secret-2024';

function base64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}

export function createToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now() }));
  // Simplified signature (not cryptographically secure — demo only)
  const sig = base64url(SECRET + '.' + header + '.' + body);
  return `${header}.${body}.${sig}`;
}

export function parseToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64urlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function isValidToken(token) {
  if (!token) return false;
  const payload = parseToken(token);
  return payload !== null;
}

// ─── Hardcoded credentials ───────────────────────────────────────────────────
export const USERS = [
  {
    id: 'mgr-001',
    username: 'manager',
    password: 'fleet2024',
    role: 'manager',
    name: 'Alex Johnson',
    avatar: 'AJ',
  },
  {
    id: 'drv-001',
    username: 'driver1',
    password: 'road1234',
    role: 'driver',
    name: 'Mike Torres',
    avatar: 'MT',
    truckId: 'T-001',
  },
  {
    id: 'drv-002',
    username: 'driver2',
    password: 'road1234',
    role: 'driver',
    name: 'Sarah Chen',
    avatar: 'SC',
    truckId: 'T-002',
  },
  {
    id: 'drv-003',
    username: 'driver3',
    password: 'road1234',
    role: 'driver',
    name: 'James Patel',
    avatar: 'JP',
    truckId: 'T-003',
  },
  {
    id: 'drv-004',
    username: 'driver4',
    password: 'road1234',
    role: 'driver',
    name: 'Lisa Nguyen',
    avatar: 'LN',
    truckId: 'T-004',
  },
  {
    id: 'drv-005',
    username: 'driver5',
    password: 'road1234',
    role: 'driver',
    name: 'Carlos Rivera',
    avatar: 'CR',
    truckId: 'T-005',
  },
];

export function authenticate(username, password) {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  const { password: _pw, ...payload } = user;
  return { user: payload, token: createToken(payload) };
}
