import React, { useState } from 'react';
import { Edit3, Check, X, Target } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  max: number;
  title: string;
  onValueChange: (newValue: number) => void;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({ value, max, title, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String((Number.isFinite(value) && value >= 0) ? value : 0));
  const [isEmApuracao, setIsEmApuracao] = useState(false);

  const safeMax = Math.max(Number.isFinite(max) ? max : 0, 1);
  const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;
  const rawPercentage = (safeValue / safeMax) * 100;
  const percentage = Math.max(0, Math.min(rawPercentage, 100));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = Math.max(0, Math.min(circumference, circumference - (percentage / 100) * circumference));

  // Cor baseada na performance
  const getColor = () => {
    const ratio = safeValue / safeMax;
    if (ratio >= 0.9) return 'text-emerald-600';
    if (ratio >= 0.7) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getStrokeColor = () => {
    const ratio = safeValue / safeMax;
    if (ratio >= 0.9) return '#059669';
    if (ratio >= 0.7) return '#d97706';
    return '#e11d48';
  };

  const handleSave = () => {
    const newValue = parseInt(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onValueChange(newValue);
      setIsEmApuracao(false); // Disable "Em apuração" when a value is saved
    } else {
      setEditValue(String((Number.isFinite(value) && value >= 0) ? value : 0));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String((Number.isFinite(value) && value >= 0) ? value : 0));
    setIsEditing(false);
  };

  const toggleEmApuracao = () => {
    setIsEmApuracao(!isEmApuracao);
    setIsEditing(false); // Close editing mode when toggling "Em apuração"
  };

  return (
    <div className="text-center group">
      <h3 className="font-semibold text-slate-800 mb-2 text-base">{title}</h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
            }}
          />
        </svg>
        
        {/* Value or "Em Apuração" in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isEditing ? (
            <div className="flex flex-col items-center space-y-2 bg-white rounded-lg p-2 shadow-lg border">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-16 text-center text-xl font-bold border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {title === 'ITB' && (
                <button
                  onClick={toggleEmApuracao}
                  className={`mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    isEmApuracao 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isEmApuracao ? '✓ Em Apuração' : 'Em Apuração'}
                </button>
              )}
            </div>
          ) : (
            <div 
              className="cursor-pointer hover:bg-white/80 rounded-xl p-3 transition-all duration-200 hover:shadow-lg backdrop-blur-sm"
              onClick={() => setIsEditing(true)}
            >
              <div className={`text-3xl font-bold ${getColor()} mb-1`}>
                {isEmApuracao ? 'AP' : value}
              </div>
              <Edit3 className="h-3 w-3 text-slate-400 mx-auto opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-1 text-xs text-amber-600 font-medium mb-2">
        <Target className="h-3 w-3" />
        <span>Meta: {max} pts</span>
      </div>
      
      {/* Performance indicator */}
      <div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          isEmApuracao ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          percentage >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
          percentage >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
          'bg-rose-100 text-rose-800 border border-rose-200'
        }`}>
          {isEmApuracao ? 'Em Apuração' : `${Math.round(percentage)}%`}
        </div>
      </div>
    </div>
  );
};

export default CircularGauge;