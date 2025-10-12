# Tela de Resultado do Quiz Diagnóstico

Esta tela apresenta o resumo de desempenho do quiz diagnóstico, com agrupamento de habilidades, feedback de domínio e destaques de novas insígnias.

## Onde está

- Rota: [`app/quiz/result.tsx`](../app/quiz/result.tsx)
- Página: [`src/pages/results/DiagnosticQuizResultPage.tsx`](../src/pages/results/DiagnosticQuizResultPage.tsx)
- Componentes reutilizáveis: [`src/pages/results/components`](../src/pages/results/components)
- Tipos e utilitários: [`src/model/quizResult.ts`](../src/model/quizResult.ts) e [`src/utils/quizResult.ts`](../src/utils/quizResult.ts)

## Como fornecer os dados

A tela espera um payload JSON com o resultado do diagnóstico (estrutura de `DiagnosticConclusionPayload`) serializado na query string `result`. Exemplo:

```
/quiz/result?result={"pontuacao":0,"totalQuestoes":10,"totalCorretas":0,"habilidades":[...],"novasInsignias":[]}
```

No fluxo real, utilize o serviço `getDiagnosticQuizResult` definido em [`src/service/diagnosticQuizService.ts`](../src/service/diagnosticQuizService.ts) para buscar o resultado a partir do `sessaoId` retornado pelo backend.

## Executando o projeto

```bash
npm install
npm run start
```

## Testes

Os principais utilitários de transformação possuem testes unitários com Vitest:

```bash
npm run test
```

## Próximos passos sugeridos

- Conectar o fluxo de conclusão do quiz para navegar automaticamente para `/quiz/result` com o payload serializado.
- Mapear os dados das insígnias reais (id, título, ícone) assim que a API estiver disponível.
