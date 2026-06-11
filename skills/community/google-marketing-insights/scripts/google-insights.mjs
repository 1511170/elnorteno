#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};
  for (const arg of rest) {
    if (!arg.startsWith('--')) continue;
    const [k, ...v] = arg.slice(2).split('=');
    flags[k] = v.length ? v.join('=') : true;
  }
  return { command, flags };
}

function loadDotEnv(file = '.env') {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function readServiceAccount() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  const rawPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!rawPath) {
    throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS o GOOGLE_SERVICE_ACCOUNT_JSON en .env');
  }
  const filePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function getAccessToken() {
  const sa = readServiceAccount();
  if (!sa.client_email || !sa.private_key) {
    throw new Error('El JSON de Service Account debe tener client_email y private_key');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google token error ${res.status}: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function googleJson(url, { method = 'GET', body } = {}) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`Google API error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function dateDaysAgo(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

async function gscSites() {
  const data = await googleJson('https://www.googleapis.com/webmasters/v3/sites');
  return { source: 'search-console', sites: data.siteEntry || [] };
}

async function gscPerformance(flags) {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) throw new Error('Falta GSC_SITE_URL');
  const days = Number(flags.days || 28);
  const dimensions = String(flags.dimensions || 'query,page').split(',').map((s) => s.trim()).filter(Boolean);
  const limit = Number(flags.limit || 1000);
  const body = {
    startDate: flags.startDate || dateDaysAgo(days),
    endDate: flags.endDate || dateDaysAgo(1),
    dimensions,
    rowLimit: limit,
    startRow: Number(flags.startRow || 0),
  };
  const encoded = encodeURIComponent(siteUrl);
  const data = await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
    method: 'POST',
    body,
  });
  return { source: 'search-console', siteUrl, request: body, rows: data.rows || [] };
}

async function ga4RunReport(body) {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error('Falta GA4_PROPERTY_ID');
  const data = await googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    body,
  });
  return { source: 'ga4', propertyId, request: body, ...data };
}

async function ga4Overview(flags) {
  const days = Number(flags.days || 28);
  return ga4RunReport({
    dateRanges: [{ startDate: flags.startDate || dateDaysAgo(days), endDate: flags.endDate || dateDaysAgo(1) }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'engagementRate' },
      { name: 'conversions' },
      { name: 'totalRevenue' },
    ],
  });
}

async function ga4Pages(flags) {
  const days = Number(flags.days || 28);
  const limit = Number(flags.limit || 100);
  return ga4RunReport({
    dateRanges: [{ startDate: flags.startDate || dateDaysAgo(days), endDate: flags.endDate || dateDaysAgo(1) }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'engagementRate' },
      { name: 'conversions' },
      { name: 'totalRevenue' },
    ],
    limit,
  });
}

function help() {
  return {
    usage: 'node google-insights.mjs <command> [--days=28] [--limit=100]',
    commands: [
      'gsc:sites',
      'gsc:performance --days=28 --dimensions=query,page --limit=1000',
      'ga4:overview --days=28',
      'ga4:pages --days=28 --limit=100',
    ],
    env: [
      'GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON',
      'GSC_SITE_URL',
      'GA4_PROPERTY_ID',
    ],
  };
}

async function main() {
  loadDotEnv();
  const { command, flags } = parseArgs(process.argv.slice(2));
  let result;
  if (command === 'gsc:sites') result = await gscSites();
  else if (command === 'gsc:performance') result = await gscPerformance(flags);
  else if (command === 'ga4:overview') result = await ga4Overview(flags);
  else if (command === 'ga4:pages') result = await ga4Pages(flags);
  else result = help();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }, null, 2));
  process.exit(1);
});
