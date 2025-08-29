import React from 'react';

interface MonthlyChartProps {
  data: Array<{ month: string; value: number; isCurrentMonth?: boolean }>;
  target: number;
  selectedMonth: number;
  onMonthClick: (monthIndex: number) => void;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, target, selectedMonth, onMonthClick }) => {
  // Vertical scale is fixed at 0–100. We reserve top/bottom paddings for labels.
  const maxValue = 100;
  const chartHeight = 380;
  const plotPaddingTop = 24;   // px
  const plotPaddingBottom = 36; // px

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-slate-800">Evolução Mensal</h3>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-slate-600 font-medium">Pontuação Total</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span className="text-slate-600 font-medium">Meta (80 pts)</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200/50">
        <div className="relative" style={{ height: chartHeight }}>
          {/* Plotting area with fixed paddings so labels don't affect alignment */}
          <div className="absolute inset-x-0" style={{ top: plotPaddingTop, bottom: plotPaddingBottom }}>
            {/* Target line at 80 points; aligned using inner plotting height */}
            {(() => {
              const innerHeight = chartHeight - plotPaddingTop - plotPaddingBottom;
              const linePoints = 90; // show line at 90 points while keeping label visibility at 80
              const lineBottom = (linePoints / 100) * innerHeight;
              const compensate = 1; // compensate 2px dashed stroke thickness
              return (
                <div
                  className="absolute w-full border-t-2 border-dashed border-amber-400 z-10"
                  style={{ bottom: `${Math.max(0, Math.round(lineBottom) - compensate)}px` }}
                >
                  <span className="absolute -right-12 -top-3 text-xs text-amber-600 font-semibold bg-white px-2 py-1 rounded-lg shadow-sm border border-amber-200">
                    80
                  </span>
                </div>
              );
            })()}

            {/* Bars */}
            <div className="flex items-end justify-between h-full space-x-4">
              {data.map((item, index) => {
                const innerHeight = chartHeight - plotPaddingTop - plotPaddingBottom;
                const barHeight = Math.max(0, Math.min((item.value / maxValue) * innerHeight, innerHeight));
                const isSelected = index === selectedMonth;
                const isCurrent = item.isCurrentMonth;
                
                return (
                  <div key={item.month} className="flex flex-col items-center flex-1 group">
                    <div className="relative flex-1 flex items-end">
                      <div
                        className={`mx-auto rounded-t-md transition-all duration-500 ease-out cursor-pointer relative overflow-visible ${
                          isSelected 
                            ? 'bg-blue-600 shadow-lg ring-2 ring-blue-400 ring-offset-2' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } hover:shadow-lg`}
                        style={{ height: `${barHeight}px`, width: '28px' }}
                        onClick={() => onMonthClick(index)}
                      >
                        {/* Highlight for current month */}
                        {isCurrent && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-400"></div>
                        )}
                        {/* Value label always visible */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                          {item.value}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm mt-3 capitalize font-medium transition-colors ${
                      isSelected ? 'text-blue-700' : isCurrent ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {item.month}
                      {isCurrent && <div className="w-1 h-1 bg-amber-400 rounded-full mx-auto mt-1"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default MonthlyChart;