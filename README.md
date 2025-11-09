# Progresso App

Este repositório contém um aplicativo Expo. Siga os passos abaixo para rodar o projeto em modo de desenvolvimento.

## Pré-requisitos
- Node.js 18 ou superior
- npm (vem junto com o Node.js)
- Conta Expo (opcional, mas recomendada para usar o Expo Go)

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. (Opcional) Crie um arquivo `.env` na raiz e defina a URL da API, por exemplo:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:8080
   ```
3. Inicie o app:
   ```bash
   npx expo start
   ```
4. No terminal, escolha abrir no Expo Go (dispositivo físico), emulador Android/iOS ou no navegador.

## Scripts úteis
- `npm run lint`: executa o lint do projeto.
- `npm run test`: executa os testes (se houver).
- `npm run reset-project`: recria o diretório `app` com um template limpo.

Para mais detalhes sobre o Expo, consulte a [documentação oficial](https://docs.expo.dev/).
