# Importação de Dados via Excel

## Como usar a funcionalidade de importação

### 1. Formato do Arquivo Excel

O arquivo Excel deve conter **DUAS PLANILHAS**:

#### **Planilha 1 - Indicadores Gerais**
Colunas obrigatórias:
- **mes**: Número do mês (1-12)
- **ano**: Ano (2020-2030)
- **evolucao**: Nome do mês para o gráfico (ex: Janeiro, Fevereiro, etc.)
- **itb**: Valor do indicador ITB
- **pdv**: Valor do indicador PDV
- **fachada**: Valor do indicador Fachada
- **pitstop**: Valor do indicador PitStop
- **academia**: Valor do indicador Academia Moura
- **real**: Valor real total para exibição no dashboard
- **performance**: Percentual de performance (ex: 75.5)

#### **Planilha 2 - Vendedores Detalhados**
Colunas obrigatórias:
- **equipe**: "Manoel" ou "Wellington"
- **vendedor**: Nome do vendedor
- **mes**: Número do mês (1-12)
- **ano**: Ano (2020-2030)
- **pdv meta**: Meta de PDV
- **pdv real**: Real de PDV
- **fachada meta**: Meta de Fachada
- **fachada real**: Real de Fachada
- **pitstop meta**: Meta de PitStop
- **pitstop real**: Real de PitStop
- **academia moura meta**: Meta de Academia Moura
- **academia moura real**: Real de Academia Moura

### 2. Exemplo de Estrutura

#### Planilha 1 - Indicadores:
```
mes | ano | evolucao | itb | pdv | fachada | pitstop | academia | real | performance
1   | 2024| Janeiro  | 10  | 12  | 5        | 12      | 15       | 54   | 75.5
2   | 2024| Fevereiro| 15  | 18  | 8        | 14      | 16       | 71   | 88.8
```

#### Planilha 2 - Vendedores:
```
equipe    | vendedor | mes | ano | pdv meta | pdv real | fachada meta | fachada real | pitstop meta | pitstop real | academia moura meta | academia moura real
Manoel    | Eduardo  | 1   | 2024| 1        | 2        | 0            | 1            | 1            | 1            | 1                   | 0
Wellington| Jocimar  | 1   | 2024| 1        | 0        | 0            | 0            | 0            | 0            | 1                   | 2
```

### 3. Como Importar

1. Clique no botão **"Importar Excel"** no cabeçalho do dashboard
2. Selecione o arquivo Excel (.xlsx ou .xls) com duas planilhas
3. O sistema validará ambas as planilhas automaticamente
4. Se houver erros, eles serão exibidos na tela
5. Se a importação for bem-sucedida, os dados serão atualizados no dashboard e na tabela de vendedores

### 4. Validações

O sistema valida:
- ✅ Presença de pelo menos 2 planilhas
- ✅ Presença de todas as colunas obrigatórias em cada planilha
- ✅ Mês deve ser um número entre 1 e 12
- ✅ Ano deve ser um número entre 2020 e 2030
- ✅ Equipe deve ser "Manoel" ou "Wellington"
- ✅ Valores numéricos válidos para todos os campos
- ✅ Formato correto do arquivo

### 5. Cálculos Automáticos

O sistema calcula automaticamente:
- **Desvio**: Real - Meta
- **Percentual**: (Real / Meta) * 100
- **Farol**: Verde (≥100%), Amarelo (≥80% ou desvio ≥0), Vermelho (<80%)

### 6. Dicas

- Use o arquivo `exemplo_completo.xlsx` como modelo
- Os valores vazios serão considerados como 0
- A importação substitui os dados existentes
- Mantenha a ordem das colunas conforme o exemplo
- Nomes de vendedores devem ser únicos

### 7. Suporte

Se encontrar problemas:
- Verifique se o arquivo tem exatamente 2 planilhas
- Confirme se todas as colunas estão presentes e na ordem correta
- Certifique-se de que os valores estão em formato numérico
- Verifique se as equipes estão escritas exatamente como "Manoel" ou "Wellington"
