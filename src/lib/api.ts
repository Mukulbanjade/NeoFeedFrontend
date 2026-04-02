const API_URL_KEY = "neofeed_api_url";
const PIN_KEY = "neofeed_pin";
const AUTH_KEY = "neofeed_authenticated";

export function getApiUrl(): string {
  return localStorage.getItem(API_URL_KEY) || "https://neofeed.onrender.com";
}

export function setApiUrl(url: string) {
  localStorage.setItem(API_URL_KEY, url);
}

export function getPin(): string {
  return localStorage.getItem(PIN_KEY) || "";
}

export function setPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(val: boolean) {
  localStorage.setItem(AUTH_KEY, val ? "true" : "false");
}

export function logout() {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${getApiUrl()}${path}`;
  const pin = getPin();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(pin ? { "X-Pin": pin } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at?: string;
}

export interface Cluster {
  id: string;
  representative_title: string;
  summary: string;
  category: string;
  trust_level: "verified" | "likely_true" | "unverified" | "likely_false";
  importance_score: number;
  source_count: number;
  user_vote?: "up" | "down" | null;
  articles?: Article[];
}

export interface Preferences {
  ai_weight: number;
  crypto_weight: number;
  favorite_sources: string[];
}
