const XLSX = require('xlsx');

// Dados da Planilha 1 - Indicadores
const planilha1 = [
  ['mes', 'ano', 'notames', 'itb', 'pdv', 'fachadas', 'pitstop', 'academia'],
  [1, 2024, 'Janeiro', 10, 12, 5, 12, 15],
  [2, 2024, 'Fevereiro', 15, 18, 8, 14, 16],
  [3, 2024, 'Março', 12, 15, 6, 13, 17],
  [4, 2024, 'Abril', 18, 20, 10, 15, 18],
  [5, 2024, 'Maio', 16, 22, 12, 14, 19],
  [6, 2024, 'Junho', 14, 19, 9, 15, 18],
  [7, 2024, 'Julho', 20, 25, 15, 15, 20],
  [8, 2024, 'Agosto', 17, 21, 11, 14, 17],
  [9, 2024, 'Setembro', 13, 15, 8, 15, 18],
  [10, 2024, 'Outubro', 0, 0, 0, 0, 0],
  [11, 2024, 'Novembro', 0, 0, 0, 0, 0],
  [12, 2024, 'Dezembro', 0, 0, 0, 0, 0]
];

// Dados da Planilha 2 - Vendedores
const planilha2 = [
  ['equipe', 'vendedor', 'mes', 'ano', 'pdv meta', 'pdv real', 'fachada meta', 'fachada real', 'pitstop meta', 'pitstop real', 'academia moura meta', 'academia moura real'],
  ['Manoel', 'Eduardo', 1, 2024, 1, 2, 0, 1, 1, 1, 1, 0],
  ['Manoel', 'Joaquim B.', 1, 2024, 2, 2, 0, 0, 0, 0, 1, 1],
  ['Manoel', 'Dorivan', 1, 2024, 1, 1, 1, 0, 0, 0, 0, 0],
  ['Manoel', 'Marcia', 1, 2024, 0, 0, 0, 0, 0, 0, 0, 0],
  ['Manoel', 'Joaquim Jr', 1, 2024, 2, 2, 0, 0, 0, 0, 0, 0],
  ['Wellington', 'Jocimar', 1, 2024, 1, 0, 0, 0, 0, 0, 1, 2],
  ['Wellington', 'José Neto', 1, 2024, 1, 1, 0, 0, 0, 0, 0, 0],
  ['Wellington', 'Luis Felipe', 1, 2024, 2, 2, 0, 0, 0, 0, 0, 0],
  ['Wellington', 'Thayna', 1, 2024, 2, 3, 0, 0, 1, 1, 1, 1]
];

// Criar workbook
const workbook = XLSX.utils.book_new();

// Converter dados para worksheets
const ws1 = XLSX.utils.aoa_to_sheet(planilha1);
const ws2 = XLSX.utils.aoa_to_sheet(planilha2);

// Adicionar worksheets ao workbook
XLSX.utils.book_append_sheet(workbook, ws1, 'Indicadores');
XLSX.utils.book_append_sheet(workbook, ws2, 'Vendedores');

// Salvar arquivo
XLSX.writeFile(workbook, 'exemplo_completo_real.xlsx');

console.log('Arquivo exemplo_completo_real.xlsx criado com sucesso!');
