const XLSX = require('xlsx');

// Dados simples para teste
const dados1 = [
  ['mes', 'ano', 'notames', 'itb', 'pdv', 'fachadas', 'pitstop', 'academia'],
  [1, 2024, 'Janeiro', 10, 12, 5, 12, 15]
];

const dados2 = [
  ['equipe', 'vendedor', 'mes', 'ano', 'pdv meta', 'pdv real', 'fachada meta', 'fachada real', 'pitstop meta', 'pitstop real', 'academia moura meta', 'academia moura real'],
  ['Manoel', 'Eduardo', 1, 2024, 1, 2, 0, 1, 1, 1, 1, 0]
];

const workbook = XLSX.utils.book_new();
const ws1 = XLSX.utils.aoa_to_sheet(dados1);
const ws2 = XLSX.utils.aoa_to_sheet(dados2);

XLSX.utils.book_append_sheet(workbook, ws1, 'Indicadores');
XLSX.utils.book_append_sheet(workbook, ws2, 'Vendedores');

XLSX.writeFile(workbook, 'teste_simples.xlsx');
console.log('Arquivo teste_simples.xlsx criado!');
