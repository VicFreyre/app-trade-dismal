import React, { useState } from 'react';
import { Check, X, TrendingUp, TrendingDown, Minus, Filter, Users, BarChart3 } from 'lucide-react';
import FilterBar from './FilterBar';

interface VendorData {
  name: string;
  team: 'Manoel' | 'Wellington';
  area: string;
  pdv: { meta: number; real: number };
  fachadas: { meta: number; real: number };
  pitStop: { meta: number; real: number };
  academia: { meta: number; real: number };
}

interface VendorTableProps {
  selectedMonth: number;
  selectedYear: number;
}

const VendorTable: React.FC<VendorTableProps> = ({ selectedMonth, selectedYear }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | 'Manoel' | 'Wellington'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const [vendors, setVendors] = useState<VendorData[]>([
    { name: 'Eduardo', team: 'Manoel', area: 'Área 1', pdv: { meta: 1, real: 2 }, fachadas: { meta: 0, real: 1 }, pitStop: { meta: 1, real: 1 }, academia: { meta: 1, real: 0 } },
    { name: 'Joaquim B.', team: 'Manoel', area: 'Área 2', pdv: { meta: 2, real: 2 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 1, real: 1 } },
    { name: 'Dorivan', team: 'Manoel', area: 'Área 3', pdv: { meta: 1, real: 1 }, fachadas: { meta: 1, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 0, real: 0 } },
    { name: 'Marcia', team: 'Manoel', area: 'Área 4', pdv: { meta: 0, real: 0 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 0, real: 0 } },
    { name: 'Joaquim Jr', team: 'Manoel', area: 'Área 5', pdv: { meta: 2, real: 2 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 0, real: 0 } },
    { name: 'Jocimar', team: 'Wellington', area: 'Área 1', pdv: { meta: 1, real: 0 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 1, real: 2 } },
    { name: 'Ivanildo', team: 'Wellington', area: 'Área 2', pdv: { meta: 1, real: 1 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 0, real: 0 } },
    { name: 'Luis Felipe', team: 'Wellington', area: 'Área 3', pdv: { meta: 2, real: 2 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 0, real: 0 }, academia: { meta: 0, real: 0 } },
    { name: 'Thayna', team: 'Wellington', area: 'Área 4', pdv: { meta: 2, real: 3 }, fachadas: { meta: 0, real: 0 }, pitStop: { meta: 1, real: 1 }, academia: { meta: 1, real: 1 } },
  ]);

  const getPercentage = (real: number, meta: number) => {
    if (meta === 0) return real > 0 ? 100 : 0;
    return Math.round((real / meta) * 100);
  };

  const getDesvio = (real: number, meta: number) => {
    return real - meta;
  };

  const getFarol = (percentage: number, desvio: number) => {
    if (percentage >= 100) return 'green';
    if (percentage >= 80 || desvio >= 0) return 'yellow';
    return 'red';
  };

  const getFarolIcon = (percentage: number, desvio: number) => {
    const farol = getFarol(percentage, desvio);
    switch (farol) {
      case 'green':
        return <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>;
      case 'yellow':
        return <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>;
      case 'red':
        return <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm"></div>;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getDesvioIcon = (desvio: number) => {
    if (desvio > 0) return <TrendingUp className="w-3 h-3 text-emerald-600" />;
    if (desvio < 0) return <TrendingDown className="w-3 h-3 text-rose-600" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const handleCellClick = (vendorIndex: number, field: string, type: 'meta' | 'real') => {
    const cellId = `${vendorIndex}-${field}-${type}`;
    const vendor = filteredVendors[vendorIndex];
    const originalIndex = vendors.findIndex(v => v.name === vendor.name);
    const currentValue = vendors[originalIndex][field][type];
    
    setEditingCell(cellId);
    setEditValue(currentValue.toString());
  };

  const handleSave = () => {
    if (!editingCell) return;
    
    const [vendorIndex, field, type] = editingCell.split('-');
    const vendor = filteredVendors[parseInt(vendorIndex)];
    const originalIndex = vendors.findIndex(v => v.name === vendor.name);
    const newValue = parseInt(editValue);
    
    if (!isNaN(newValue) && newValue >= 0) {
      setVendors(prev => {
        const updated = [...prev];
        updated[originalIndex][field][type] = newValue;
        return updated;
      });
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderEditableCell = (value: number, vendorIndex: number, field: string, type: 'meta' | 'real') => {
    const cellId = `${vendorIndex}-${field}-${type}`;
    const isEditing = editingCell === cellId;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-12 text-center text-sm border border-blue-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
            <Check className="h-3 w-3" />
          </button>
          <button onClick={handleCancel} className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <span 
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors font-medium"
        onClick={() => handleCellClick(vendorIndex, field, type)}
      >
        {value}
      </span>
    );
  };

  const getTeamTotals = (team: 'Manoel' | 'Wellington', filteredData: VendorData[]) => {
    const teamVendors = filteredData.filter(v => v.team === team);
    return {
      pdv: {
        meta: teamVendors.reduce((sum, v) => sum + v.pdv.meta, 0),
        real: teamVendors.reduce((sum, v) => sum + v.pdv.real, 0),
      },
      fachadas: {
        meta: teamVendors.reduce((sum, v) => sum + v.fachadas.meta, 0),
        real: teamVendors.reduce((sum, v) => sum + v.fachadas.real, 0),
      },
      pitStop: {
        meta: teamVendors.reduce((sum, v) => sum + v.pitStop.meta, 0),
        real: teamVendors.reduce((sum, v) => sum + v.pitStop.real, 0),
      },
      academia: {
        meta: teamVendors.reduce((sum, v) => sum + v.academia.meta, 0),
        real: teamVendors.reduce((sum, v) => sum + v.academia.real, 0),
      },
    };
  };

  // Filtrar vendedores
  const filteredVendors = vendors.filter(vendor => {
    const teamMatch = teamFilter === 'all' || vendor.team === teamFilter;
    const areaMatch = areaFilter === 'all' || vendor.area === areaFilter;
    return teamMatch && areaMatch;
  });

  // Obter áreas únicas
  const uniqueAreas = [...new Set(vendors.map(v => v.area))];

  // Dados para gráficos
  const getChartData = () => {
    const indicators = ['pdv', 'fachadas', 'pitStop', 'academia'];
    return indicators.map(indicator => {
      const totalMeta = filteredVendors.reduce((sum, v) => sum + v[indicator].meta, 0);
      const totalReal = filteredVendors.reduce((sum, v) => sum + v[indicator].real, 0);
      return {
        name: indicator === 'pdv' ? 'PDV' : indicator === 'fachadas' ? 'Fachadas' : indicator === 'pitStop' ? 'PitStop' : 'Academia',
        meta: totalMeta,
        real: totalReal
      };
    });
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.flatMap(d => [d.meta, d.real]));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Filtros de Visualização</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Equipe</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Equipes</option>
              <option value="Manoel">Equipe Manoel</option>
              <option value="Wellington">Equipe Wellington</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Área</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Áreas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Mês</label>
            <select
              value={selectedMonth}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-500"
            >
              <option>{new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long' })}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Ano</label>
            <select
              value={selectedYear}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-500"
            >
              <option>{selectedYear}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gráficos de Meta vs Realizado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Meta vs Realizado</h3>
          </div>
          <div className="space-y-4">
            {chartData.map((item) => {
              const denom = Math.max(item.meta, item.real, 1);
              const metaPct = Math.min(100, Math.round((item.meta / denom) * 100));
              const realPct = Math.min(100, Math.round((item.real / denom) * 100));
              return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">Meta: {item.meta} | Real: {item.real}</span>
                </div>
                {/* Single line with overlay: Meta (blue) as base, Real (amber) on top */}
                <div className="relative h-6 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${metaPct}%` }}
                  ></div>
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
                    style={{ width: `${realPct}%` }}
                  ></div>
                </div>
              </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
              <span className="text-slate-600">Meta</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"></div>
              <span className="text-slate-600">Realizado</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Resumo da Equipe</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{filteredVendors.length}</div>
                <div className="text-sm text-slate-600">Vendedores</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">
                  {Math.round((chartData.reduce((sum, item) => sum + item.real, 0) / Math.max(chartData.reduce((sum, item) => sum + item.meta, 0), 1)) * 100)}%
                </div>
                <div className="text-sm text-slate-600">Performance</div>
              </div>
            </div>
            {teamFilter === 'all' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Equipe 1 - Manoel</span>
                  <span className="text-blue-600">{vendors.filter(v => v.team === 'Manoel').length} vendedores</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-emerald-800">Equipe 2 - Wellington</span>
                  <span className="text-emerald-600">{vendors.filter(v => v.team === 'Wellington').length} vendedores</span>
                </div>
              </div>
            )}
            {areaFilter !== 'all' && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">Vendedores na {areaFilter}</div>
                <div className="flex flex-wrap gap-2">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((v) => (
                      <span
                        key={v.name}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          v.team === 'Manoel'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {v.name} • {v.team}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Nenhum vendedor nesta área</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Vendedores */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50">
          <h2 className="text-xl font-semibold text-slate-800">Acompanhamento Detalhado</h2>
          <p className="text-sm text-slate-600 mt-1">
            {filteredVendors.length} vendedor(es) • {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Vendedor</th>
                <th className="px-4 py-4 text-center font-semibold" colSpan={4}>PDV DE SUCESSO</th>
                <th className="px-4 py-4 text-center font-semibold" colSpan={4}>FACHADAS</th>
                <th className="px-4 py-4 text-center font-semibold" colSpan={4}>PIT STOP</th>
                <th className="px-4 py-4 text-center font-semibold" colSpan={4}>ACADEMIA MOURA</th>
              </tr>
              <tr className="bg-blue-500/90">
                <th className="px-4 py-3"></th>
                {['PDV DE SUCESSO', 'FACHADAS', 'PIT STOP', 'ACADEMIA MOURA'].map((indicator) => (
                  <React.Fragment key={indicator}>
                    <th className="px-2 py-3 text-xs font-medium">Meta</th>
                    <th className="px-2 py-3 text-xs font-medium">Real</th>
                    <th className="px-2 py-3 text-xs font-medium">Desvio</th>
                    <th className="px-2 py-3 text-xs font-medium">%</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Mostrar totais por equipe baseado no filtro */}
              {teamFilter === 'all' ? (
                <>
                  {/* Equipe 1 - Manoel */}
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100/50 font-semibold">
                    <td className="px-4 py-4 text-blue-800 font-bold">Equipe 1 - Manoel</td>
                    {['pdv', 'fachadas', 'pitStop', 'academia'].map((field) => {
                      const totals = getTeamTotals('Manoel', filteredVendors);
                      const { meta, real } = totals[field];
                      const desvio = getDesvio(real, meta);
                      const percentage = getPercentage(real, meta);
                      
                      return (
                        <React.Fragment key={field}>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{meta}</td>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{real}</td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getDesvioIcon(desvio)}
                              <span className={`font-semibold ${desvio > 0 ? 'text-emerald-600' : desvio < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {desvio}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getFarolIcon(percentage, desvio)}
                              <span className="text-blue-700 font-bold">{percentage}%</span>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Equipe 2 - Wellington */}
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100/50 font-semibold">
                    <td className="px-4 py-4 text-blue-800 font-bold">Equipe 2 - Wellington</td>
                    {(['pdv', 'fachadas', 'pitStop', 'academia'] as const).map((field) => {
                      const totals = getTeamTotals('Wellington', filteredVendors);
                      const { meta, real } = totals[field];
                      const desvio = getDesvio(real, meta);
                      const percentage = getPercentage(real, meta);
                      
                      return (
                        <React.Fragment key={field}>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{meta}</td>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{real}</td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getDesvioIcon(desvio)}
                              <span className={`font-semibold ${desvio > 0 ? 'text-emerald-600' : desvio < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {desvio}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getFarolIcon(percentage, desvio)}
                              <span className="text-blue-700 font-bold">{percentage}%</span>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </>
              ) : (
                <>
                  {/* Equipe selecionada */}
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100/50 font-semibold">
                    <td className="px-4 py-4 text-blue-800 font-bold">
                      {teamFilter === 'Manoel' ? 'Equipe 1 - Manoel' : 'Equipe 2 - Wellington'}
                    </td>
                    {(['pdv', 'fachadas', 'pitStop', 'academia'] as const).map((field) => {
                      const totals = getTeamTotals(teamFilter, filteredVendors);
                      const { meta, real } = totals[field];
                      const desvio = getDesvio(real, meta);
                      const percentage = getPercentage(real, meta);
                      
                      return (
                        <React.Fragment key={field}>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{meta}</td>
                          <td className="px-2 py-4 text-center text-blue-700 font-bold">{real}</td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getDesvioIcon(desvio)}
                              <span className={`font-semibold ${desvio > 0 ? 'text-emerald-600' : desvio < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {desvio}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getFarolIcon(percentage, desvio)}
                              <span className="text-blue-700 font-bold">{percentage}%</span>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* Vendedores organizados por equipe e área */}
              {/* Equipe 1 - Manoel */}
              {filteredVendors
                .filter(v => v.team === 'Manoel')
                .sort((a, b) => a.area.localeCompare(b.area))
                .map((vendor, index) => (
                  <tr key={vendor.name} className="transition-colors hover:bg-blue-50/30 odd:bg-white even:bg-blue-50/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-slate-800">{vendor.area} - {vendor.name}</div>
                          <div className="text-xs text-blue-600 font-medium">Equipe 1 - Manoel</div>
                        </div>
                      </div>
                    </td>
                    {(['pdv', 'fachadas', 'pitStop', 'academia'] as const).map((field) => {
                      const { meta, real } = vendor[field];
                      const desvio = getDesvio(real, meta);
                      const percentage = getPercentage(real, meta);
                      
                      return (
                        <React.Fragment key={field}>
                          <td className="px-2 py-4 text-center">
                            {renderEditableCell(meta, index, field, 'meta')}
                          </td>
                          <td className="px-2 py-4 text-center">
                            {renderEditableCell(real, index, field, 'real')}
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getDesvioIcon(desvio)}
                              <span className={`font-medium ${desvio > 0 ? 'text-emerald-600' : desvio < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {desvio}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getFarolIcon(percentage, desvio)}
                              <span className={`font-medium ${percentage >= 100 ? 'text-emerald-600' : percentage >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {meta === 0 && real === 0 ? '-' : `${percentage}%`}
                              </span>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}

              {/* Equipe 2 - Wellington */}
              {filteredVendors
                .filter(v => v.team === 'Wellington')
                .sort((a, b) => a.area.localeCompare(b.area))
                .map((vendor, index) => (
                  <tr key={vendor.name} className="transition-colors hover:bg-blue-50/30 odd:bg-white even:bg-blue-50/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-slate-800">{vendor.area} - {vendor.name}</div>
                          <div className="text-xs text-blue-600 font-medium">Equipe 2 - Wellington</div>
                        </div>
                      </div>
                    </td>
                    {(['pdv', 'fachadas', 'pitStop', 'academia'] as const).map((field) => {
                      const { meta, real } = vendor[field];
                      const desvio = getDesvio(real, meta);
                      const percentage = getPercentage(real, meta);
                      
                      return (
                        <React.Fragment key={field}>
                          <td className="px-2 py-4 text-center">
                            {renderEditableCell(meta, index, field, 'meta')}
                          </td>
                          <td className="px-2 py-4 text-center">
                            {renderEditableCell(real, index, field, 'real')}
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getDesvioIcon(desvio)}
                              <span className={`font-medium ${desvio > 0 ? 'text-emerald-600' : desvio < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {desvio}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getFarolIcon(percentage, desvio)}
                              <span className={`font-medium ${percentage >= 100 ? 'text-emerald-600' : percentage >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {meta === 0 && real === 0 ? '-' : `${percentage}%`}
                              </span>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}

              {/* Total Geral */}
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold">
                <td className="px-4 py-4 text-lg">Dismal Matriz</td>
                {['pdv', 'fachadas', 'pitStop', 'academia'].map((field) => {
                  const totalMeta = filteredVendors.reduce((sum, v) => sum + v[field].meta, 0);
                  const totalReal = filteredVendors.reduce((sum, v) => sum + v[field].real, 0);
                  const desvio = getDesvio(totalReal, totalMeta);
                  const percentage = getPercentage(totalReal, totalMeta);
                  
                  return (
                    <React.Fragment key={field}>
                      <td className="px-2 py-4 text-center font-bold">{totalMeta}</td>
                      <td className="px-2 py-4 text-center font-bold">{totalReal}</td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {getDesvioIcon(desvio)}
                          <span className="font-bold">{desvio}</span>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getFarolIcon(percentage, desvio)}
                          <span className="font-bold">{percentage}%</span>
                        </div>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorTable;