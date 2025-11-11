import React, { useState, useEffect, Component } from 'react';
import { BarChart3, Users, Calendar } from 'lucide-react';
import SemiCircularGauge from './components/SemiCircularGauge';
import MonthlyChart from './components/MonthlyChart';
import VendorTable from './components/VendorTable';
import FilterBar from './components/FilterBar';
import ExcelImport from './components/ExcelImport';

type IndicatorKey = 'itb' | 'pdv' | 'fachada' | 'pitstop' | 'academia';
type MonthData = Record<IndicatorKey, number> & {
  evolucao: string;
  real: number;
  performance: number;
};
type DataState = Record<number, Record<number, MonthData>>;

interface VendorData {
  name: string;
  team: 'Manoel' | 'Wellington';
  area: string;
  month: number;
  year: number;
  pdv: { meta: number; real: number };
  fachadas: { meta: number; real: number };
  pitStop: { meta: number; real: number };
  academia: { meta: number; real: number };
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Erro inesperado' };
  }
  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Dashboard error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border mt-8 text-center">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">Ocorreu um erro</h2>
          <p className="text-sm text-slate-600 mb-4">{this.state.message}</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => this.setState({ hasError: false, message: '' })}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(8); // Forçar setembro para testar
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [isViewerAuthed, setIsViewerAuthed] = useState<boolean>(false);

  // Detectar modo admin (somente máquina local) ou público via querystring
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const forcePublic = searchParams.get('public') === '1' || searchParams.get('mode') === 'public';
  const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isAdmin = !forcePublic && isLocalHost;

  // Dados dos indicadores principais por mês
  const [monthlyIndicators, setMonthlyIndicators] = useState<DataState>({
    2024: {
      0: { itb: 10, pdv: 12, fachada: 5, pitstop: 12, academia: 15, evolucao: 'Janeiro', real: 54, performance: 75.5 }, // Janeiro
      1: { itb: 15, pdv: 18, fachada: 8, pitstop: 14, academia: 16, evolucao: 'Fevereiro', real: 71, performance: 88.8 }, // Fevereiro
      2: { itb: 12, pdv: 15, fachada: 6, pitstop: 13, academia: 17, evolucao: 'Março', real: 63, performance: 78.8 }, // Março
      3: { itb: 18, pdv: 20, fachada: 10, pitstop: 15, academia: 18, evolucao: 'Abril', real: 81, performance: 100 }, // Abril
      4: { itb: 16, pdv: 22, fachada: 12, pitstop: 14, academia: 19, evolucao: 'Maio', real: 83, performance: 100 }, // Maio
      5: { itb: 14, pdv: 19, fachada: 9, pitstop: 15, academia: 18, evolucao: 'Junho', real: 75, performance: 93.8 }, // Junho
      6: { itb: 20, pdv: 25, fachada: 15, pitstop: 15, academia: 20, evolucao: 'Julho', real: 95, performance: 100 }, // Julho
      7: { itb: 17, pdv: 21, fachada: 11, pitstop: 14, academia: 17, evolucao: 'Agosto', real: 80, performance: 100 }, // Agosto
      8: { itb: 13, pdv: 15, fachada: 8, pitstop: 15, academia: 18, evolucao: 'Setembro', real: 69, performance: 86.3 }, // Setembro (atual)
      9: { itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, evolucao: 'Outubro', real: 0, performance: 0 }, // Outubro
      10: { itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, evolucao: 'Novembro', real: 0, performance: 0 }, // Novembro
      11: { itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, evolucao: 'Dezembro', real: 0, performance: 0 }, // Dezembro
    }
  });

  const indicators = {
    itb: { target: 20, name: 'ITB' },
    pdv: { target: 25, name: 'PDV de Sucesso' },
    fachada: { target: 20, name: 'Fachada' },
    pitstop: { target: 15, name: 'PitStop' },
    academia: { target: 20, name: 'Academia Moura' }
  };

  // Carregar dados persistentes (localStorage) na inicialização
  useEffect(() => {
    try {
      const savedIndicators = localStorage.getItem('dashtrade_monthlyIndicators');
      const savedVendors = localStorage.getItem('dashtrade_vendors');
      if (savedIndicators) {
        const parsed = JSON.parse(savedIndicators);
        if (parsed && typeof parsed === 'object') {
          setMonthlyIndicators((prev) => ({ ...prev, ...parsed }));
        }
      }
      if (savedVendors) {
        const parsedVendors = JSON.parse(savedVendors);
        if (Array.isArray(parsedVendors)) setVendors(parsedVendors);
      }
    } catch {
      // ignore
    }
    // Autenticação do viewer pública mantida na sessão
    const authed = sessionStorage.getItem('dashtrade_viewer_authed') === '1';
    setIsViewerAuthed(authed);
  }, []);

  const getCurrentIndicators = () => {
    const yearData = monthlyIndicators[selectedYear] || {};
    const monthData: MonthData = yearData[selectedMonth] || { 
      itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, 
      evolucao: '', real: 0, performance: 0 
    };
    
    
    // Garantir que os valores sejam números válidos
    const safeValue = (val: any) => {
      const num = Number(val);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };
    
    return {
      itb: { value: safeValue(monthData.itb), target: indicators.itb.target, name: indicators.itb.name },
      pdv: { value: safeValue(monthData.pdv), target: indicators.pdv.target, name: indicators.pdv.name },
      fachada: { value: safeValue(monthData.fachada), target: indicators.fachada.target, name: indicators.fachada.name },
      pitstop: { value: safeValue(monthData.pitstop), target: indicators.pitstop.target, name: indicators.pitstop.name },
      academia: { value: safeValue(monthData.academia), target: indicators.academia.target, name: indicators.academia.name }
    };
  };



  const handleIndicatorsImport = (importedData: DataState) => {
    setMonthlyIndicators(prev => {
      const merged = { ...prev, ...importedData } as DataState;
      try {
        localStorage.setItem('dashtrade_monthlyIndicators', JSON.stringify(merged));
      } catch {
        // ignore storage failures
      }
      return merged;
    });
  };

  const handleVendorsImport = (importedData: VendorData[]) => {
    setVendors(importedData);
    try {
      localStorage.setItem('dashtrade_vendors', JSON.stringify(importedData));
    } catch {
      // ignore
    }
  };

  // Gerar dados mensais para o gráfico
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const yearData = monthlyIndicators[selectedYear] || {};
    
    return months.map((month, index) => {
      const monthData: MonthData = yearData[index] || { itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, evolucao: '', real: 0, performance: 0 };
      const value = monthData.real || (monthData.itb + monthData.pdv + monthData.fachada + monthData.pitstop + monthData.academia);
      
      return {
        month: month.toLowerCase(),
        value: value,
        isCurrentMonth: index === selectedMonth
      };
    });
  };

  const currentIndicators = getCurrentIndicators();
  
  const currentMonthData = monthlyIndicators[selectedYear]?.[selectedMonth] || { itb: 0, pdv: 0, fachada: 0, pitstop: 0, academia: 0, evolucao: '', real: 0, performance: 0 };
  const totalDiagnostico = currentMonthData.real || Object.values(currentIndicators).reduce((sum, ind) => sum + ind.value, 0);
  const totalMeta = 100; // Meta fixa de 100
  const performance = currentMonthData.performance || Math.round((totalDiagnostico / totalMeta) * 100);

  // Gate público com senha simples
  if (!isAdmin && !isViewerAuthed) {
    let passwordInput = '';
    const handleSubmit = () => {
      if (passwordInput === 'dismal') {
        sessionStorage.setItem('dashtrade_viewer_authed', '1');
        setIsViewerAuthed(true);
      } else {
        alert('Senha incorreta');
      }
    };
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-lg font-semibold text-slate-800 mb-2 text-center">Acesso ao Dashboard</h1>
          <p className="text-sm text-slate-600 mb-4 text-center">Insira a senha para visualizar.</p>
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => { passwordInput = e.target.value; }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk2Hb50x6Q8lpb8eaOZXyBTm2fYHDrXPLdSg&s" 
                  alt="Dashboard Trade" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Dashboard Trade</h1>
                <p className="text-xs text-slate-500">Diagnóstico e Acompanhamento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Dashboard
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('vendors')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'vendors'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Por Vendedor
                  </button>
                )}
              </nav>
              {isAdmin ? (
                <ExcelImport 
                  onIndicatorsImport={handleIndicatorsImport}
                  onVendorsImport={handleVendorsImport}
                />
              ) : (
                <a
                  className="text-xs text-slate-600 hover:text-blue-700 underline"
                  href={(() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('public', '1');
                    return url.toString();
                  })()}
                  target="_blank"
                  rel="noreferrer"
                >
                  Link público
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Filtros */}
            <FilterBar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />

            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(currentIndicators).map(([key, indicator]) => (
                <SemiCircularGauge
                  key={key}
                  value={indicator.value}
                  max={indicator.target}
                  title={indicator.name}
                />
              ))}
            </div>

            {/* Diagnóstico Trade Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/30 p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Diagnóstico Trade</h2>
                  <p className="text-slate-600 text-sm">Acompanhamento mensal da pontuação total</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center bg-blue-50/60 px-2.5 py-1.5 rounded-lg ring-1 ring-blue-200">
                    <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {totalDiagnostico}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">Real</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{totalMeta}</div>
                    <div className="text-xs text-slate-500 font-medium">Meta Total</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      performance >= 80 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {performance}%
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Performance</div>
                  </div>
                </div>
              </div>

              <MonthlyChart 
                data={getMonthlyChartData()} 
                target={80} 
                selectedMonth={selectedMonth}
                onMonthClick={(monthIndex) => {
                  setSelectedMonth(monthIndex);
                }}
              />
            </div>

            {/* Informações adicionais */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Atenção</h3>
                  <p className="text-sm text-blue-700">
                    Os valores de ITB podem sofrer alterações até o 15º dia útil do mês.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <VendorTable 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            vendors={vendors}
            onVendorsUpdate={setVendors}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;