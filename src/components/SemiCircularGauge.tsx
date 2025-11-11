import React from 'react';

interface SemiCircularGaugeProps {
  value: number;
  max: number;
  title: string;
}

const SemiCircularGauge: React.FC<SemiCircularGaugeProps> = ({ value, max, title }) => {
	// Valores seguros e porcentagem sincronizada com a nota do indicador (value/max)
	const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
	const safeMax = isNaN(max) || !isFinite(max) || max <= 0 ? 1 : max;
	const percentage = Math.max(0, Math.min((safeValue / safeMax) * 100, 100));

	const getColor = (p: number) => {
		if (p >= 100) return '#10b981'; // verde
		if (p >= 80) return '#f59e0b'; // âmbar
		if (p >= 60) return '#f97316'; // laranja
		return '#ef4444'; // vermelho
	};

	const color = getColor(percentage);

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/30 p-6 hover:shadow-md transition-all duration-300">
			<div className="text-center">
				<h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>

				{/* Valor e alvo */}
				<div className="mb-3">
					<div className="text-2xl font-bold" style={{ color }}>{safeValue}</div>
					<div className="text-xs text-slate-500">de {safeMax}</div>
				</div>

				{/* Barra de progresso horizontal, alinhada e responsiva */}
				<div className="w-full max-w-[220px] mx-auto">
					<div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-200/80">
						<div
							className="h-full rounded-full transition-all duration-700 ease-out"
							style={{ width: `${percentage}%`, background: color }}
						/>
					</div>
					<div className="mt-2 text-xs font-semibold" style={{ color }}>{Math.round(percentage)}%</div>
				</div>
			</div>
		</div>
	);
};

export default SemiCircularGauge;

