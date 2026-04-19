// ─── NavPro API Service ───────────────────────────────────────────────────────
// Base URL: https://api.truckerpath.com/navpro
// Auth: Bearer <JWT token> in every request header

const BASE_URL = 'https://api.truckerpath.com/navpro';
const TOKEN_KEY = 'navpro_api_token';

export function getNavproToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setNavproToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearNavproToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function headers(extra = {}) {
  const token = getNavproToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(method, path, body, extraHeaders = {}) {
  const opts = {
    method,
    headers: headers(extraHeaders),
  };
  if (body !== undefined && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const get = (path) => request('GET', path);
const post = (path, body, extraHeaders) => request('POST', path, body, extraHeaders);
const del = (path, body) => request('DELETE', path, body);

// ─── 0. Drivers ──────────────────────────────────────────────────────────────

export const queryDrivers = (params = {}) =>
  post('/api/driver/query', { page: 0, size: 50, ...params });

export const queryDriverPerformance = (params) =>
  post('/api/driver/performance/query', params);

export const inviteDriver = (driverInfo) =>
  post('/api/driver/invite', { driver_info: Array.isArray(driverInfo) ? driverInfo : [driverInfo] });

export const editDriver = (params) =>
  post('/api/driver/edit', params);

export const deleteDriver = (driver_id) =>
  del(`/api/driver/delete/${driver_id}`);

// ─── 1. Vehicles ─────────────────────────────────────────────────────────────

export const queryVehicles = (params = {}) =>
  post('/api/vehicle/query', { page: 0, size: 50, ...params });

export const addVehicle = (params) =>
  post('/api/vehicle/add', params);

export const editVehicle = (params) =>
  post('/api/vehicle/edit', params);

export const updateVehicleStatus = (vehicle_id, vehicle_status) =>
  post('/api/vehicle/update/status', { vehicle_id, vehicle_status });

export const deleteVehicle = (vehicle_ids) =>
  del('/api/vehicle/delete', { vehicle_ids: Array.isArray(vehicle_ids) ? vehicle_ids : [vehicle_ids] });

// ─── 2. Tracking ─────────────────────────────────────────────────────────────

export const queryDriverDispatch = (driver_id, startTime, endTime, date_source = 'APP') =>
  post('/api/tracking/get/driver-dispatch', {
    driver_id,
    time_range: { start_time: startTime, end_time: endTime },
    date_source,
  });

// ─── 3. Documents ────────────────────────────────────────────────────────────

export const queryDocuments = (params = {}) =>
  post('/api/document/query', { page: 0, size: 50, ...params });

export const editDocument = (params) =>
  post('/api/document/edit', params);

export const addDocument = async (file, documentInfo) => {
  const token = getNavproToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentInfo', JSON.stringify({ documentInfo }));

  const res = await fetch(`${BASE_URL}/api/document/add?file=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
};

export const deleteDocument = (document_id, scope = 'UPLOAD_FILE') =>
  del('/api/document/delete', { document_id, scope });

// ─── 4. Terminals ────────────────────────────────────────────────────────────

export const getTerminals = () => get('/api/terminal/get/list');

export const createTerminal = (terminal_name) =>
  post('/api/terminal/create', { terminal_name });

export const editTerminal = (terminal_id, terminal_name) =>
  post('/api/terminal/edit', { terminal_id, terminal_name });

export const deleteTerminal = (terminal_id) =>
  del(`/api/terminal/delete/${terminal_id}`);

export const getTerminalMembers = (terminal_id, page = 0, size = 50) =>
  get(`/api/terminal/get/member/${terminal_id}?page=${page}&size=${size}`);

export const addTerminalMember = (terminal_id, memberIds) =>
  post('/api/terminal/add/member', {
    terminal_id,
    members: Array.isArray(memberIds) ? memberIds : [memberIds],
  });

export const deleteTerminalMember = (terminal_id, member_id) =>
  del(`/api/terminal/delete/member/${terminal_id}/${member_id}`);

// ─── 5. Users ────────────────────────────────────────────────────────────────

export const getUsers = (page = 0, size = 50) =>
  get(`/api/users/get/all?page=${page}&size=${size}`);

// ─── 6. POI ──────────────────────────────────────────────────────────────────

export const queryPOI = (params) => post('/api/poi/query', params);
export const editPOI = (params) => post('/api/poi/edit', params);
export const addPOI = (params) => post('/api/poi/add', params);
export const deletePOI = (poi_id) => del(`/api/poi/delete/${poi_id}`);
export const getPOIGroups = () => get('/api/poi/get/group');

// ─── 7. Trips ────────────────────────────────────────────────────────────────

export const createTrip = (tripInfo, idempotencyKey) =>
  post('/api/trip/create', tripInfo, idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {});

// ─── 8. Routing Profiles ─────────────────────────────────────────────────────

export const getRoutingProfiles = (page = 0, size = 50) =>
  get(`/api/routing-profile/list?page=${page}&size=${size}`);
