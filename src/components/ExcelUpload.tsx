import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onDataImport: (data: any) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataImport }) => {
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
      const data = await readExcelFile(file);
      const result = validateAndParseData(data);
      
      if (result.success) {
        onDataImport(result.data);
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

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsBinaryString(file);
    });
  };

  const validateAndParseData = (data: any[]): ImportResult => {
    // Verificar se há dados
    if (!data || data.length < 2) {
      return {
        success: false,
        message: 'O arquivo deve conter pelo menos um cabeçalho e uma linha de dados.'
      };
    }

    // Primeira linha deve conter os cabeçalhos
    const headers = data[0] as string[];
    const expectedHeaders = ['Mês', 'Ano', 'ITB', 'PDV de Sucesso', 'Fachada', 'PitStop', 'Academia Moura'];
    
    // Verificar se os cabeçalhos estão corretos
    const hasValidHeaders = expectedHeaders.every(header => 
      headers.some(h => h && h.toString().toLowerCase().includes(header.toLowerCase()))
    );

    if (!hasValidHeaders) {
      return {
        success: false,
        message: `Cabeçalhos esperados: ${expectedHeaders.join(', ')}. Verifique se o arquivo está no formato correto.`
      };
    }

    // Processar dados
    const processedData: any = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row || row.length === 0) continue;

      const mes = parseInt(row[0]);
      const ano = parseInt(row[1]);
      const itb = parseInt(row[2]) || 0;
      const pdv = parseInt(row[3]) || 0;
      const fachada = parseInt(row[4]) || 0;
      const pitstop = parseInt(row[5]) || 0;
      const academia = parseInt(row[6]) || 0;

      if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12) {
        return {
          success: false,
          message: `Linha ${i + 1}: Mês deve ser um número entre 1 e 12.`
        };
      }

      if (isNaN(ano) || ano < 2020 || ano > 2030) {
        return {
          success: false,
          message: `Linha ${i + 1}: Ano deve ser um número entre 2020 e 2030.`
        };
      }

      if (!processedData[ano]) {
        processedData[ano] = {};
      }

      processedData[ano][mes - 1] = {
        itb,
        pdv,
        fachada,
        pitstop,
        academia
      };
    }

    return {
      success: true,
      message: `Dados importados com sucesso! ${Object.keys(processedData).length} ano(s) processado(s).`,
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
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
                <div className="space-y-4">
                  <div className="text-center">
                    <FileSpreadsheet className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      Selecione um arquivo Excel com os dados dos indicadores
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Formato esperado:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Colunas:</strong> Mês, Ano, ITB, PDV de Sucesso, Fachada, PitStop, Academia Moura</p>
                      <p><strong>Exemplo:</strong></p>
                      <div className="bg-white p-2 rounded border text-xs font-mono">
                        Mês | Ano | ITB | PDV de Sucesso | Fachada | PitStop | Academia Moura<br/>
                        1 | 2024 | 10 | 12 | 5 | 12 | 15<br/>
                        2 | 2024 | 15 | 18 | 8 | 14 | 16
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

export default ExcelUpload;
