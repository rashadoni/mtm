'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Package, Search, RefreshCw, Wifi, WifiOff,
  ChevronDown, Download, AlertTriangle, Database,
  BarChart3, TrendingUp, Box, Warehouse,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  fetchAvailableBalances,
  checkOneCConnection,
  getMockBalances,
  type OneCBalance,
  type OneCConnectionStatus,
} from '@/lib/oneC';

export default function InventoryPage() {
  const { t } = useTranslation();
  const [balances, setBalances] = useState<OneCBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<OneCConnectionStatus | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'total'>('name');
  const [useMock, setUseMock] = useState(false);

  // Check connection on mount
  useEffect(() => {
    handleCheckConnection();
  }, []);

  const handleCheckConnection = async () => {
    const status = await checkOneCConnection();
    setConnectionStatus(status);

    if (!status.connected) {
      // Use mock data for demo
      setUseMock(true);
      setBalances(getMockBalances());
      setLastSync(new Date().toISOString());
    }
  };

  const handleSync = async () => {
    setLoading(true);
    const result = await fetchAvailableBalances();

    console.log('[1C] Response:', result);

    if (result.error || !result.data || result.data.length === 0) {
      // Fallback to mock if 1C unavailable or empty response
      if (result.rawResponse) {
        console.log('[1C] Raw response (trying to parse):', result.rawResponse);
        // Try to extract data from raw response
        const raw = result.rawResponse;
        const items = raw?.data || raw?.Items || raw?.items || raw?.value || raw?.result || raw?.products || [];
        if (Array.isArray(items) && items.length > 0) {
          setUseMock(false);
          setBalances(items);
          setLastSync(new Date().toISOString());
          setLoading(false);
          return;
        }
      }
      setUseMock(true);
      setBalances(getMockBalances());
    } else {
      setUseMock(false);
      setBalances(result.data);
    }

    setLastSync(new Date().toISOString());
    setLoading(false);
  };

  // Derived data
  // Helper to get display values from mixed 1C response format
  const getName = (b: OneCBalance) => b.Номенклатура || b.Name || b.name || '';
  const getCode = (b: OneCBalance) => b.Код || b.Code || b.code || '';
  const getWarehouse = (b: OneCBalance) => b.Склад || b.Warehouse || b.warehouse || '';
  const getGroup = (b: OneCBalance) => b.Группа || b.Group || b.group || '';
  const getQty = (b: OneCBalance) => b.Количество || b.Quantity || b.quantity || 0;
  const getPrice = (b: OneCBalance) => b.Цена || b.Price || b.price || 0;
  const getTotal = (b: OneCBalance) => b.Сумма || b.Amount || b.amount || 0;
  const getUnit = (b: OneCBalance) => b.ЕдиницаИзмерения || b.Unit || b.unit || '';
  const getBarcode = (b: OneCBalance) => b.Штрихкод || b.Barcode || b.barcode || '';

  const warehouses = useMemo(() => Array.from(new Set(balances.map((b) => getWarehouse(b)).filter(Boolean))).sort(), [balances]);
  const groups = useMemo(() => Array.from(new Set(balances.map((b) => getGroup(b)).filter(Boolean))).sort() as string[], [balances]);

  const filteredBalances = useMemo(() => {
    let result = balances;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((b) =>
        getName(b).toLowerCase().includes(term) ||
        getCode(b).toLowerCase().includes(term) ||
        getBarcode(b).includes(term)
      );
    }
    if (warehouseFilter !== 'all') result = result.filter((b) => getWarehouse(b) === warehouseFilter);
    if (groupFilter !== 'all') result = result.filter((b) => getGroup(b) === groupFilter);

    result.sort((a, b) => {
      if (sortBy === 'name') return getName(a).localeCompare(getName(b));
      if (sortBy === 'quantity') return getQty(b) - getQty(a);
      if (sortBy === 'total') return getTotal(b) - getTotal(a);
      return 0;
    });

    return result;
  }, [balances, searchTerm, warehouseFilter, groupFilter, sortBy]);

  // Stats
  const totalProducts = balances.length;
  const totalQuantity = balances.reduce((s, b) => s + getQty(b), 0);
  const totalAmount = balances.reduce((s, b) => s + getTotal(b), 0);
  const outOfStock = balances.filter((b) => getQty(b) === 0).length;
  const lowStock = balances.filter((b) => getQty(b) > 0 && getQty(b) < 100).length;

  const handleExport = () => {
    const csv = [
      [t('inventory.product'), t('inventory.code'), t('inventory.warehouse'), t('inventory.quantity'), t('inventory.price'), t('inventory.total'), t('inventory.unit'), t('inventory.barcode'), t('inventory.group')],
      ...filteredBalances.map((b) => [getName(b), getCode(b), getWarehouse(b), getQty(b), getPrice(b) || '', getTotal(b) || '', getUnit(b), getBarcode(b), getGroup(b)]),
    ].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1C_balances_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('inventory.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            1C: Zeytun Pharm — AvailableBalances
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
            connectionStatus?.connected
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          )}>
            {connectionStatus?.connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connectionStatus?.connected ? t('inventory.connected') : t('inventory.disconnected')}
            {connectionStatus?.responseTime && (
              <span className="text-xs opacity-70">{connectionStatus.responseTime}ms</span>
            )}
          </div>

          {useMock && (
            <Badge variant="warning" className="text-xs">{t('inventory.demoMode')}</Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('inventory.sync')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-1.5"
          >
            <Download size={14} />
            CSV
          </Button>
        </div>
      </div>

      {/* Last sync info */}
      {lastSync && (
        <p className="text-xs text-gray-400">
          {t('inventory.lastSync')}: {new Date(lastSync).toLocaleString()}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<Package size={20} />} title={t('inventory.totalProducts')} value={totalProducts} color="#6C63FF" />
        <StatCard icon={<Box size={20} />} title={t('inventory.totalQuantity')} value={totalQuantity.toLocaleString()} color="#00BFA6" />
        <StatCard icon={<TrendingUp size={20} />} title={t('inventory.totalAmount')} value={`₼${totalAmount.toLocaleString()}`} color="#3498DB" />
        <StatCard icon={<AlertTriangle size={20} />} title={t('inventory.outOfStock')} value={outOfStock} color="#E74C3C" />
        <StatCard icon={<BarChart3 size={20} />} title={t('inventory.lowStock')} value={lowStock} color="#FFC107" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t('inventory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              />
            </div>
            <div className="relative">
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="appearance-none w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white pr-8"
              >
                <option value="all">{t('inventory.allWarehouses')}</option>
                {warehouses.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="appearance-none w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white pr-8"
              >
                <option value="all">{t('inventory.allGroups')}</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balances Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database size={16} />
              {t('inventory.balances')} ({filteredBalances.length})
            </CardTitle>
            <div className="flex gap-1">
              {[
                { key: 'name', label: t('common.name') },
                { key: 'quantity', label: t('inventory.quantity') },
                { key: 'total', label: t('inventory.total') },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key as typeof sortBy)}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    sortBy === s.key ? 'text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                  )}
                  style={sortBy === s.key ? { backgroundColor: 'var(--primary)' } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.code')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.product')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.group')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.warehouse')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.quantity')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.price')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.total')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('inventory.barcode')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map((item, idx) => {
                  const qty = getQty(item);
                  const price = getPrice(item);
                  const total = getTotal(item);
                  return (
                    <tr key={`${getCode(item)}-${idx}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">{getCode(item)}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{getName(item)}</p>
                        {getUnit(item) && <span className="text-[10px] text-gray-400">{getUnit(item)}</span>}
                      </td>
                      <td className="py-3 px-4">
                        {getGroup(item) && <Badge variant="secondary" className="text-[10px]">{getGroup(item)}</Badge>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Warehouse size={12} /> {getWarehouse(item)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn('text-sm font-bold', qty === 0 ? 'text-red-500' : qty < 100 ? 'text-yellow-600' : 'text-gray-900 dark:text-white')}>
                          {qty.toLocaleString()}
                        </span>
                        {qty === 0 && <span className="block text-[10px] text-red-400">{t('inventory.outOfStock')}</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                        {price ? `₼${price.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {total ? `₼${total.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-400">
                        {getBarcode(item) || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBalances.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">{t('common.noData')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
