# Progresso App

Este repositório contém um aplicativo Expo. Siga os passos abaixo para rodar o projeto em modo de desenvolvimento.

## Pré-requisitos
- Node.js 22.0.0 ou superior

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na raiz e defina a URL da API, por exemplo:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:8080 ou EXPO_PUBLIC_API_URL=http://192.168.0.134:8080
   ```
3. Inicie o app:
   ```bash
   npx expo start
   ```
4. No terminal, escolha abrir no Expo Go (dispositivo físico), emulador Android/iOS ou no navegador.