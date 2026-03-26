'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  Calendar,
  TrendingUp,
  Navigation,
  Users,
  Radio,
  Image as ImageIcon,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Check,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  lastGenerated: string;
  dataPoints: number;
}

const reportCards: ReportCard[] = [
  {
    id: '1',
    title: 'Gündəlik Hesabat',
    description: 'Gündəlik ziyarət və tapşırıq nəticələrinin ətraflı analizi',
    icon: <Calendar size={32} />,
    color: '#6C63FF',
    href: '/reports/daily',
    lastGenerated: '17 Mar 2026, 18:00',
    dataPoints: 248,
  },
  {
    id: '2',
    title: 'Agent Performans',
    description: 'Agentlərin fəaliyyət göstəricilərinin təhlili',
    icon: <TrendingUp size={32} />,
    color: '#00BFA6',
    href: '/reports/performance',
    lastGenerated: '17 Mar 2026, 15:30',
    dataPoints: 156,
  },
  {
    id: '3',
    title: 'Marşrut İcrası',
    description: 'Marşrut planlarının icra və sapma analizi',
    icon: <Navigation size={32} />,
    color: '#FFC107',
    href: '/reports/route-execution',
    lastGenerated: '16 Mar 2026, 20:00',
    dataPoints: 92,
  },
  {
    id: '4',
    title: 'Müştəri Ziyarətləri',
    description: 'Müştəri ziyarət edileçəklərin və sıxlığının analizi',
    icon: <Users size={32} />,
    color: '#E74C3C',
    href: '/reports/customer-visits',
    lastGenerated: '17 Mar 2026, 12:00',
    dataPoints: 384,
  },
  {
    id: '5',
    title: 'GPS & Lokasiya',
    description: 'Agentlərin GPS əhvali-ruhiyyəsi və cihaz batareyasının monitorinqi',
    icon: <Radio size={32} />,
    color: '#3498DB',
    href: '/reports/gps-tracking',
    lastGenerated: '17 Mar 2026, 16:45',
    dataPoints: 1240,
  },
  {
    id: '6',
    title: 'Foto Hesabat',
    description: 'Çəkilən fotoların keyfiyyət və əhəmiyyətli məlumatın auditası',
    icon: <ImageIcon size={32} />,
    color: '#9B59B6',
    href: '/reports/photo-audit',
    lastGenerated: '17 Mar 2026, 14:20',
    dataPoints: 456,
  },
];

// ========= Export Utility Functions =========
function exportCSV(data: Record<string, string | number>[], filename: string) {
  const BOM = '\uFEFF';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function exportExcel(data: Record<string, string | number>[], filename: string) {
  const headers = Object.keys(data[0]);
  let xml = '<?xml version="1.0"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '  <Worksheet ss:Name="Hesabat">\n';
  xml += '    <Table>\n';
  // Header row
  xml += '      <Row>\n';
  headers.forEach((h) => {
    xml += `        <Cell><Data ss:Type="String">${h}</Data></Cell>\n`;
  });
  xml += '      </Row>\n';
  // Data rows
  data.forEach((row) => {
    xml += '      <Row>\n';
    headers.forEach((h) => {
      const val = row[h];
      const type = typeof val === 'number' ? 'Number' : 'String';
      xml += `        <Cell><Data ss:Type="${type}">${val}</Data></Cell>\n`;
    });
    xml += '      </Row>\n';
  });
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  xml += '</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

function exportPDF() {
  // Opens browser print dialog which can save as PDF
  window.print();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Mock export data
const mockExportData = [
  { Agent: 'Əhməd Məmmədov', Ziyarət: 18, Tamamlanma: 92, Foto: 32, Marşrut: 'Nəsimi' },
  { Agent: 'Farid Hüseynov', Ziyarət: 15, Tamamlanma: 85, Foto: 28, Marşrut: 'Yasamal' },
  { Agent: 'Leyla Qasımova', Ziyarət: 21, Tamamlanma: 96, Foto: 41, Marşrut: 'Xətai' },
  { Agent: 'Rəfail Əliəv', Ziyarət: 14, Tamamlanma: 78, Foto: 25, Marşrut: 'Nizami' },
  { Agent: 'Sərxan Yusifov', Ziyarət: 19, Tamamlanma: 90, Foto: 36, Marşrut: 'Binəqədi' },
  { Agent: 'Nigar Hüseynova', Ziyarət: 12, Tamamlanma: 88, Foto: 22, Marşrut: 'Sabunçu' },
  { Agent: 'Ramil Cəfərov', Ziyarət: 16, Tamamlanma: 91, Foto: 30, Marşrut: 'Suraxanı' },
  { Agent: 'Günel Əhmədova', Ziyarət: 20, Tamamlanma: 94, Foto: 38, Marşrut: 'Nərimanov' },
];

type ExportFormat = 'csv' | 'excel' | 'pdf';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');

  const handleExport = (format: ExportFormat) => {
    setExportMenuOpen(false);

    switch (format) {
      case 'csv':
        exportCSV(mockExportData, `mtm-hesabat-${new Date().toISOString().slice(0, 10)}`);
        break;
      case 'excel':
        exportExcel(mockExportData, `mtm-hesabat-${new Date().toISOString().slice(0, 10)}`);
        break;
      case 'pdf':
        exportPDF();
        break;
    }

    setExportedFormat(format);
    setTimeout(() => setExportedFormat(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Export Success Toast */}
      {exportedFormat && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check size={16} />
          <span className="text-sm font-medium">
            {exportedFormat.toUpperCase()} {t('reports.exportSuccess')}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.reports')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Date Range Filter */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(['today', 'week', 'month'] as const).map((range) => {
              const labels = { today: t('common.today'), week: t('common.thisWeek'), month: t('common.thisMonth') };
              return (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                    dateRange === range
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  )}
                >
                  {labels[range]}
                </button>
              );
            })}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
            >
              <Download size={18} />
              {t('common.export')}
              <ChevronDown size={14} />
            </Button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileText size={16} className="text-green-600" />
                  CSV (UTF-8)
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  Excel (XML)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Printer size={16} className="text-red-500" />
                  PDF (Print)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report) => (
          <Link key={report.id} href={report.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: report.color + '15' }}
                    >
                      <div style={{ color: report.color }}>{report.icon}</div>
                    </div>
                    <Badge
                      className="text-[10px]"
                      style={{ backgroundColor: report.color + '20', color: report.color }}
                    >
                      {report.dataPoints} {t('reports.records')}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {report.description}
                    </p>
                  </div>

                  {/* Last Generated */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t('reports.lastGenerated')}: {report.lastGenerated}
                    </span>
                    <span className="text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: report.color }}>
                      {t('common.view')} →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Export Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter size={18} style={{ color: 'var(--primary)' }} />
              {t('reports.agentPerformance')}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <FileText size={14} className="mr-1" />CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <FileSpreadsheet size={14} className="mr-1" />Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('common.name')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('reports.visits')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('reports.completion')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('photos.title')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('reports.region')}</th>
                </tr>
              </thead>
              <tbody>
                {mockExportData.map((row) => (
                  <tr key={row.Agent} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: '#6C63FF' }}
                        >
                          {String(row.Agent).split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{row.Agent}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{row.Ziyarət}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.Tamamlanma}%`,
                              backgroundColor: Number(row.Tamamlanma) >= 90 ? '#10B981' : Number(row.Tamamlanma) >= 80 ? '#6C63FF' : '#FFC107',
                            }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${Number(row.Tamamlanma) >= 90 ? 'text-green-600' : Number(row.Tamamlanma) >= 80 ? 'text-indigo-600' : 'text-yellow-600'}`}>
                          {row.Tamamlanma}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{row.Foto}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.Marşrut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('reports.types')}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>6</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('reports.createdToday')}</p>
            <p className="text-3xl font-bold text-green-600">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('common.thisWeek')}</p>
            <p className="text-3xl font-bold text-blue-600">68</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('common.thisMonth')}</p>
            <p className="text-3xl font-bold text-purple-600">285</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
