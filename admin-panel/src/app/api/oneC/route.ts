import { NextRequest, NextResponse } from 'next/server';

// 1C Integration — proxy endpoint
// Forwards requests to 1C server to avoid CORS issues in browser
const ONEC_BASE_URL = process.env.ONEC_BASE_URL || 'http://185.132.107.206:6540';
const ONEC_USERNAME = process.env.ONEC_USERNAME || '';
const ONEC_PASSWORD = process.env.ONEC_PASSWORD || '';

// Whitelist of allowed 1C endpoints to prevent SSRF
const ALLOWED_ENDPOINTS = new Set([
  'AvailableBalances',
  'Products',
  'Warehouses',
  'Orders',
  'Customers',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'AvailableBalances';

  // Validate endpoint against whitelist
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json(
      { error: `Invalid endpoint: ${endpoint}. Allowed: ${Array.from(ALLOWED_ENDPOINTS).join(', ')}` },
      { status: 400 }
    );
  }

  const url = `${ONEC_BASE_URL}/ztn_mobile/hs/zeytun_pharm/${endpoint}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add Basic Auth if credentials are set
    if (ONEC_USERNAME && ONEC_PASSWORD) {
      const credentials = Buffer.from(`${ONEC_USERNAME}:${ONEC_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // 1C servers can be slow — 30 second timeout
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `1C returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Connection refused, timeout, etc.
    return NextResponse.json(
      {
        error: '1C server unavailable',
        details: error?.message || 'Connection failed',
        url: url,
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'AvailableBalances';

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json(
      { error: `Invalid endpoint: ${endpoint}` },
      { status: 400 }
    );
  }

  const body = await request.json();
  const url = `${ONEC_BASE_URL}/ztn_mobile/hs/zeytun_pharm/${endpoint}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (ONEC_USERNAME && ONEC_PASSWORD) {
      const credentials = Buffer.from(`${ONEC_USERNAME}:${ONEC_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `1C returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: '1C server unavailable', details: error?.message },
      { status: 503 }
    );
  }
}
