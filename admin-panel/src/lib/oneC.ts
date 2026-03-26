// 1C Integration Service — Zeytun Pharm
// Communicates with 1C via Next.js API proxy (/api/oneC)
// Auth: Basic WebService:Z3ytun
// Method: POST with { GUID, METRO, Warehouse }

export interface OneCBalance {
  // Fields may come in Russian or English from 1C — handle both
  Номенклатура?: string;
  Код?: string;
  Склад?: string;
  Количество?: number;
  Цена?: number;
  Сумма?: number;
  ЕдиницаИзмерения?: string;
  Штрихкод?: string;
  Группа?: string;
  // English variants
  Name?: string;
  Code?: string;
  Warehouse?: string;
  Quantity?: number;
  Price?: number;
  Amount?: number;
  Unit?: string;
  Barcode?: string;
  Group?: string;
  // Raw fields from 1C
  [key: string]: any;
}

export interface OneCResponse {
  data?: OneCBalance[];
  rawResponse?: any;
  error?: string;
  details?: string;
  timestamp?: string;
  responseTime?: number;
}

export interface OneCConnectionStatus {
  connected: boolean;
  lastCheck: string;
  serverUrl: string;
  responseTime?: number;
  error?: string;
}

// Default request parameters for Zeytun Pharm
const DEFAULT_PARAMS = {
  GUID: 'c296a4c4-b977-11f0-9926-000c293cab90',
  METRO: false,
  Warehouse: '8d596de0-c819-11ea-80e6-005056833bec',
};

/**
 * Fetch available balances from 1C Zeytun Pharm
 */
export async function fetchAvailableBalances(params?: {
  GUID?: string;
  METRO?: boolean;
  Warehouse?: string;
}): Promise<OneCResponse> {
  try {
    const start = Date.now();
    const body = { ...DEFAULT_PARAMS, ...params };

    const res = await fetch('/api/oneC?endpoint=AvailableBalances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseTime = Date.now() - start;

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${res.status}`,
        details: errorData.details,
        timestamp: new Date().toISOString(),
        responseTime,
      };
    }

    const rawData = await res.json();

    // Normalize 1C response — it can return different structures
    let balances: OneCBalance[] = [];

    if (Array.isArray(rawData)) {
      balances = rawData;
    } else if (rawData?.value && Array.isArray(rawData.value)) {
      balances = rawData.value;
    } else if (rawData?.data && Array.isArray(rawData.data)) {
      balances = rawData.data;
    } else if (rawData?.Balances && Array.isArray(rawData.Balances)) {
      balances = rawData.Balances;
    } else if (rawData?.Items && Array.isArray(rawData.Items)) {
      balances = rawData.Items;
    } else if (rawData?.result && Array.isArray(rawData.result)) {
      balances = rawData.result;
    }

    return {
      data: balances,
      rawResponse: rawData,
      timestamp: new Date().toISOString(),
      responseTime,
    };
  } catch (error: any) {
    return {
      error: 'Connection failed',
      details: error?.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check 1C connection status
 */
export async function checkOneCConnection(): Promise<OneCConnectionStatus> {
  try {
    const start = Date.now();
    const res = await fetch('/api/oneC?endpoint=AvailableBalances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_PARAMS),
      signal: AbortSignal.timeout(10000),
    });
    const responseTime = Date.now() - start;

    return {
      connected: res.ok,
      lastCheck: new Date().toISOString(),
      serverUrl: '185.132.107.206:6540',
      responseTime,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (error: any) {
    return {
      connected: false,
      lastCheck: new Date().toISOString(),
      serverUrl: '185.132.107.206:6540',
      error: error?.message || 'Connection failed',
    };
  }
}

/**
 * Normalize a 1C balance item to standard format
 */
export function normalizeBalance(item: OneCBalance): {
  name: string;
  code: string;
  warehouse: string;
  quantity: number;
  price: number;
  total: number;
  unit: string;
  barcode: string;
  group: string;
} {
  return {
    name: item.Номенклатура || item.Name || item.name || item.Description || '',
    code: item.Код || item.Code || item.code || item.Article || '',
    warehouse: item.Склад || item.Warehouse || item.warehouse || '',
    quantity: item.Количество || item.Quantity || item.quantity || item.Qty || 0,
    price: item.Цена || item.Price || item.price || 0,
    total: item.Сумма || item.Amount || item.amount || item.Total || 0,
    unit: item.ЕдиницаИзмерения || item.Unit || item.unit || item.UOM || 'шт',
    barcode: item.Штрихкод || item.Barcode || item.barcode || '',
    group: item.Группа || item.Group || item.group || item.Category || '',
  };
}

/**
 * Mock data for development/demo when 1C is unavailable
 */
export function getMockBalances(): OneCBalance[] {
  return [
    { Номенклатура: 'Amoxicillin 500mg', Код: 'MED-001', Склад: 'Əsas Anbar', Количество: 2450, Цена: 3.50, Сумма: 8575, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345001', Группа: 'Antibiotiklər' },
    { Номенклатура: 'Ibuprofen 400mg', Код: 'MED-002', Склад: 'Əsas Anbar', Количество: 1820, Цена: 2.80, Сумма: 5096, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345002', Группа: 'Ağrıkəsicilər' },
    { Номенклатура: 'Paracetamol 500mg', Код: 'MED-003', Склад: 'Əsas Anbar', Количество: 3200, Цена: 1.50, Сумма: 4800, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345003', Группа: 'Ağrıkəsicilər' },
    { Номенклатура: 'Omeprazol 20mg', Код: 'MED-004', Склад: 'Əsas Anbar', Количество: 950, Цена: 4.20, Сумма: 3990, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345004', Группа: 'Mədə-bağırsaq' },
    { Номенклатура: 'Cetirizin 10mg', Код: 'MED-005', Склад: 'Əsas Anbar', Количество: 780, Цена: 2.10, Сумма: 1638, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345005', Группа: 'Allergiya' },
    { Номенклатура: 'Metformin 850mg', Код: 'MED-006', Склад: 'Filial Anbar', Количество: 1350, Цена: 5.60, Сумма: 7560, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345006', Группа: 'Diabet' },
    { Номенклатура: 'Atorvastatin 20mg', Код: 'MED-007', Склад: 'Filial Anbar', Количество: 620, Цена: 8.90, Сумма: 5518, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345007', Группа: 'Kardiologiya' },
    { Номенклатура: 'Vitamin C 1000mg', Код: 'VIT-001', Склад: 'Əsas Anbar', Количество: 5600, Цена: 1.20, Сумма: 6720, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345010', Группа: 'Vitaminlər' },
    { Номенклатура: 'Nurofen Plus', Код: 'MED-011', Склад: 'Əsas Anbar', Количество: 0, Цена: 9.80, Сумма: 0, ЕдиницаИзмерения: 'ədəd', Штрихкод: '4760012345015', Группа: 'Ağrıkəsicilər' },
  ];
}
