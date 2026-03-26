import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

const ONEC_BASE_URL = process.env.ONEC_BASE_URL || 'http://185.132.107.206:6540';
const ONEC_USERNAME = process.env.ONEC_USERNAME || 'WebService';
const ONEC_PASSWORD = process.env.ONEC_PASSWORD || 'Z3ytun';

// Default params for Zeytun Pharm
const DEFAULT_BODY = {
  GUID: 'c296a4c4-b977-11f0-9926-000c293cab90',
  METRO: false,
  Warehouse: '8d596de0-c819-11ea-80e6-005056833bec',
};

// POST to 1C AvailableBalances
inventoryRouter.post('/balances', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = { ...DEFAULT_BODY, ...req.body };
    const url = `${ONEC_BASE_URL}/ztn_mobile/hs/zeytun_pharm/AvailableBalances`;

    const credentials = Buffer.from(`${ONEC_USERNAME}:${ONEC_PASSWORD}`).toString('base64');

    const start = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return res.status(response.status).json({
        error: `1C returned ${response.status}: ${response.statusText}`,
        responseTime,
      });
    }

    const data = await response.json();
    res.json({ source: '1C:Zeytun Pharm', timestamp: new Date().toISOString(), responseTime, data });
  } catch (error: any) {
    res.status(503).json({
      error: '1C server unavailable',
      details: error?.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET balances (convenience — uses default params)
inventoryRouter.get('/balances', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = `${ONEC_BASE_URL}/ztn_mobile/hs/zeytun_pharm/AvailableBalances`;
    const credentials = Buffer.from(`${ONEC_USERNAME}:${ONEC_PASSWORD}`).toString('base64');

    const start = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(DEFAULT_BODY),
      signal: AbortSignal.timeout(30000),
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return res.status(response.status).json({ error: `1C: ${response.status}`, responseTime });
    }

    const data = await response.json();
    res.json({ source: '1C:Zeytun Pharm', timestamp: new Date().toISOString(), responseTime, data });
  } catch (error: any) {
    res.status(503).json({ error: '1C unavailable', details: error?.message });
  }
});

// GET /status — check 1C connection
inventoryRouter.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = `${ONEC_BASE_URL}/ztn_mobile/hs/zeytun_pharm/AvailableBalances`;
    const credentials = Buffer.from(`${ONEC_USERNAME}:${ONEC_PASSWORD}`).toString('base64');

    const start = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(DEFAULT_BODY),
      signal: AbortSignal.timeout(10000),
    });
    const responseTime = Date.now() - start;

    res.json({
      connected: response.ok,
      url: ONEC_BASE_URL,
      responseTime,
      timestamp: new Date().toISOString(),
      status: response.ok ? response.status : `Error ${response.status}`,
    });
  } catch (error: any) {
    res.json({
      connected: false,
      url: ONEC_BASE_URL,
      error: error?.message,
      timestamp: new Date().toISOString(),
    });
  }
});
