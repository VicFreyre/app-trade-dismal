import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportProps {
  onIndicatorsImport: (data: any) => void;
  onVendorsImport: (data: any) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  indicatorsData?: any;
  vendorsData?: any;
}

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

const ExcelImport: React.FC<ExcelImportProps> = ({ onIndicatorsImport, onVendorsImport }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImportResult(null);

    try {
      const workbook = await readExcelFile(file);
      const result = await validateAndParseData(workbook);
      
      if (result.success) {
        if (result.indicatorsData) {
          onIndicatorsImport(result.indicatorsData);
        }
        if (result.vendorsData) {
          onVendorsImport(result.vendorsData);
        }
        setImportResult(result);
        setIsOpen(false);
      } else {
        setImportResult(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Erro ao processar o arquivo Excel. Verifique se o formato está correto.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const readExcelFile = (file: File): Promise<XLSX.WorkBook> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          resolve(workbook);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsBinaryString(file);
    });
  };

  const validateAndParseData = async (workbook: XLSX.WorkBook): Promise<ImportResult> => {
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length < 2) {
      return {
        success: false,
        message: 'O arquivo deve conter pelo menos 2 planilhas: uma para indicadores e outra para vendedores.'
      };
    }

    let indicatorsData = null;
    let vendorsData = null;
    const errors: string[] = [];

    // Processar Planilha 1 - Indicadores
    try {
      const indicatorsSheet = workbook.Sheets[sheetNames[0]];
      const indicatorsJson = XLSX.utils.sheet_to_json(indicatorsSheet, { header: 1 });
      
      const indicatorsResult = validateIndicatorsData(indicatorsJson);
      if (indicatorsResult.success) {
        indicatorsData = indicatorsResult.data;
      } else {
        errors.push(`Planilha 1 (Indicadores): ${indicatorsResult.message}`);
      }
    } catch (error) {
      errors.push('Erro ao processar planilha de indicadores');
    }

    // Processar Planilha 2 - Vendedores
    try {
      const vendorsSheet = workbook.Sheets[sheetNames[1]];
      const vendorsJson = XLSX.utils.sheet_to_json(vendorsSheet, { header: 1 });
      
      const vendorsResult = validateVendorsData(vendorsJson);
      if (vendorsResult.success) {
        vendorsData = vendorsResult.data;
      } else {
        errors.push(`Planilha 2 (Vendedores): ${vendorsResult.message}`);
      }
    } catch (error) {
      errors.push('Erro ao processar planilha de vendedores');
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: errors.join('; ')
      };
    }

    return {
      success: true,
      message: `Dados importados com sucesso! ${indicatorsData ? 'Indicadores' : ''} ${indicatorsData && vendorsData ? 'e' : ''} ${vendorsData ? 'Vendedores' : ''} processados.`,
      indicatorsData,
      vendorsData
    };
  };

  const validateIndicatorsData = (data: any[]): { success: boolean; message: string; data?: any } => {
    if (!data || data.length < 2) {
      return {
        success: false,
        message: 'Deve conter pelo menos um cabeçalho e uma linha de dados.'
      };
    }

    const headers = data[0] as string[];
    const expectedHeaders = ['mes', 'ano', 'evolucao', 'itb', 'pdv', 'fachada', 'pitstop', 'academia', 'real', 'performance'];
    
    // Validação mais flexível - verificar se pelo menos 80% dos cabeçalhos estão presentes
    const validHeaders = expectedHeaders.filter(expectedHeader => 
      headers.some(header => {
        const h = header?.toString().trim().toLowerCase();
        const e = expectedHeader.toLowerCase();
        return h === e || h?.includes(e) || e.includes(h);
      })
    );
    
    const hasValidHeaders = validHeaders.length >= Math.ceil(expectedHeaders.length * 0.8);

    if (!hasValidHeaders) {
      return {
        success: false,
        message: `Cabeçalhos esperados: ${expectedHeaders.join(', ')}. Encontrados: ${validHeaders.length}/${expectedHeaders.length}`
      };
    }

    const processedData: any = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row || row.length === 0) continue;

      const mes = parseInt(row[0]);
      const ano = parseInt(row[1]) || new Date().getFullYear();
      const evolucao = row[2]?.toString().trim() || '';
      const itb = parseInt(row[3]) || 0;
      const pdv = parseInt(row[4]) || 0;
      const fachadas = parseInt(row[5]) || 0;
      const pitstop = parseInt(row[6]) || 0;
      const academia = parseInt(row[7]) || 0;
      const real = parseInt(row[8]) || 0;
      const performance = parseFloat(row[9]) || 0;

      // Debug log para verificar os valores
      if (i <= 3) { // Log apenas das primeiras 3 linhas para debug
        console.log(`Linha ${i}:`, {
          mes, ano, evolucao, itb, pdv, fachadas, pitstop, academia, real, performance
        });
      }

      if (isNaN(mes) || mes < 1 || mes > 12) {
        return {
          success: false,
          message: `Linha ${i + 1}: Mês deve ser um número entre 1 e 12.`
        };
      }

      if (!processedData[ano]) {
        processedData[ano] = {};
      }

      processedData[ano][mes - 1] = {
        itb,
        pdv,
        fachada: fachadas,
        pitstop,
        academia,
        evolucao,
        real,
        performance
      };
    }

    return {
      success: true,
      message: 'Indicadores processados com sucesso',
      data: processedData
    };
  };

  const validateVendorsData = (data: any[]): { success: boolean; message: string; data?: VendorData[] } => {
    if (!data || data.length < 2) {
      return {
        success: false,
        message: 'Deve conter pelo menos um cabeçalho e uma linha de dados.'
      };
    }

    const headers = data[0] as string[];
    const expectedHeaders = ['equipe', 'vendedor', 'mes', 'ano', 'pdv meta', 'pdv real', 'fachada meta', 'fachada real', 'pitstop meta', 'pitstop real', 'academia moura meta', 'academia moura real'];
    
    // Validação mais flexível - verificar se pelo menos 80% dos cabeçalhos estão presentes
    const validHeaders = expectedHeaders.filter(expectedHeader => 
      headers.some(header => {
        const h = header?.toString().trim().toLowerCase();
        const e = expectedHeader.toLowerCase();
        return h === e || h?.includes(e) || e.includes(h);
      })
    );
    
    const hasValidHeaders = validHeaders.length >= Math.ceil(expectedHeaders.length * 0.8);

    if (!hasValidHeaders) {
      return {
        success: false,
        message: `Cabeçalhos esperados: ${expectedHeaders.join(', ')}. Encontrados: ${validHeaders.length}/${expectedHeaders.length}`
      };
    }

    const processedData: VendorData[] = [];

    // Mapeamento fixo de vendedor -> área por equipe (case-insensível e acentos ignorados)
    const vendorAreaByTeam: Record<'Manoel' | 'Wellington', Record<string, string>> = {
      Manoel: {
        // Área 1..5
        'eduardo': 'Área 1',
        'joaquim b.': 'Área 2',
        'joaquim b': 'Área 2',
        'dorivan': 'Área 3',
        'márcia': 'Área 4',
        'marcia': 'Área 4',
        'joaquim jr': 'Área 5',
        'joaquim j.r': 'Área 5',
      },
      Wellington: {
        // Área 1..4
        'jocimar': 'Área 1',
        'josé neto': 'Área 2',
        'jose neto': 'Área 2',
        'felipe': 'Área 3',
        'thayna': 'Área 4',
      }
    };

    const normalize = (text: string) => text
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ');

    const seen = new Set<string>(); // evita duplicados (mesmo equipe+vendedor+mes+ano)
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row || row.length === 0) continue;

      const equipeRaw = row[0]?.toString().trim();
      const vendedorRaw = row[1]?.toString().trim();
      const mes = parseInt(row[2]);
      const ano = parseInt(row[3]) || new Date().getFullYear();
      const pdvMeta = parseInt(row[4]) || 0;
      const pdvReal = parseInt(row[5]) || 0;
      const fachadaMeta = parseInt(row[6]) || 0;
      const fachadaReal = parseInt(row[7]) || 0;
      const pitstopMeta = parseInt(row[8]) || 0;
      const pitstopReal = parseInt(row[9]) || 0;
      const academiaMeta = parseInt(row[10]) || 0;
      const academiaReal = parseInt(row[11]) || 0;

      if (!equipeRaw || !vendedorRaw) {
        return {
          success: false,
          message: `Linha ${i + 1}: Equipe e vendedor são obrigatórios.`
        };
      }

      if (!['Manoel', 'Wellington'].includes(equipeRaw)) {
        return {
          success: false,
          message: `Linha ${i + 1}: Equipe deve ser 'Manoel' ou 'Wellington'.`
        };
      }

      if (isNaN(mes) || mes < 1 || mes > 12) {
        return {
          success: false,
          message: `Linha ${i + 1}: Mês deve ser um número entre 1 e 12.`
        };
      }

      const equipe = equipeRaw as 'Manoel' | 'Wellington';
      const vendedor = vendedorRaw;

      // Chave única para evitar duplicidade de registros repetidos
      const key = `${equipe}|${normalize(vendedor)}|${mes}|${ano}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      // Descobrir área com base no mapeamento fixo
      const areaMap = vendorAreaByTeam[equipe];
      const normalizedName = normalize(vendedor);
      // tentar chaves alternativas com/sem ponto
      const mappedArea = areaMap[normalizedName] || areaMap[normalizedName?.replace(/\./g, '')] || '';
      const area = mappedArea || 'Área ?';

      processedData.push({
        name: vendedor,
        team: equipe,
        area,
        month: mes,
        year: ano,
        pdv: { meta: pdvMeta, real: pdvReal },
        fachadas: { meta: fachadaMeta, real: fachadaReal },
        pitStop: { meta: pitstopMeta, real: pitstopReal },
        academia: { meta: academiaMeta, real: academiaReal }
      });
    }

    return {
      success: true,
      message: 'Vendedores processados com sucesso',
      data: processedData
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsOpen(false);
    setImportResult(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Upload className="h-4 w-4" />
        <span>Importar Excel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Importar Dados do Excel</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {importResult ? (
                <div className={`flex items-start space-x-3 p-4 rounded-lg ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResult.success ? 'Sucesso!' : 'Erro'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      importResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {importResult.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <FileSpreadsheet className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      Selecione um arquivo Excel com duas planilhas
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Planilha 1 - Indicadores:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Colunas:</strong> mes, ano, evolucao, itb, pdv, fachada, pitstop, academia, real, performance</p>
                        <p><strong>Exemplo:</strong></p>
                        <div className="bg-white p-2 rounded border text-xs font-mono">
                          mes | ano | evolucao | itb | pdv | fachada | pitstop | academia | real | performance<br/>
                          1 | 2024 | Janeiro | 10 | 12 | 5 | 12 | 15 | 54 | 75.5
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Planilha 2 - Vendedores:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Colunas:</strong> equipe, vendedor, mes, ano, pdv meta, pdv real, fachada meta, fachada real, pitstop meta, pitstop real, academia moura meta, academia moura real</p>
                        <p><strong>Exemplo:</strong></p>
                        <div className="bg-white p-2 rounded border text-xs font-mono">
                          equipe | vendedor | mes | ano | pdv meta | pdv real | fachada meta | fachada real<br/>
                          Manoel | Eduardo | 1 | 2024 | 1 | 2 | 0 | 1
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Selecionar Arquivo</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {importResult?.success ? 'Fechar' : 'Cancelar'}
              </button>
              {!importResult?.success && (
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Tentar Novamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelImport;
