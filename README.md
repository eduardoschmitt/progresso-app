# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Como funcionam as pastas `(auth)` e `(tabs)`

- O Expo Router usa **grupos de rotas**: qualquer pasta entre parênteses não vira uma rota por si só, ela serve apenas para organizar telas que compartilham o mesmo layout.
- Em `app/(auth)` ficam as telas de autenticação (login/cadastro). O arquivo `app/(auth)/_layout.tsx` define o stack sem cabeçalho para essas telas.
- Em `app/(tabs)` ficam as telas pós-login com abas inferiores. O arquivo `app/(tabs)/_layout.tsx` monta o tab navigator e cada arquivo dentro dele vira uma aba.
- O layout raiz `app/_layout.tsx` monta uma pilha com esses dois grupos e começa pelo `(auth)`. Depois que o usuário autentica, você pode navegar para as rotas dentro de `(tabs)`.
- Você pode renomear os grupos ou mover telas conforme preferir; basta manter a mesma estrutura de layouts (por exemplo, criar outro `_layout.tsx`) para controlar a navegação e visual.

### Conectando o app à sua API em rede local

- O helper `src/lib/api.ts` lê a URL base da API em `process.env.EXPO_PUBLIC_API_URL`. Crie um arquivo `.env` (ou `.env.local`) na raiz do projeto com o valor apropriado para cada ambiente.
- Em homologação/local, você pode apontar para o IP da sua máquina: por exemplo, `EXPO_PUBLIC_API_URL=http://192.168.0.134:8080`. O dispositivo que roda o app precisa estar na mesma rede Wi-Fi/LAN e o computador deve permitir conexões (verifique firewall/antivírus).
- Para Android emulador há um atalho (`10.0.2.2`), mas dispositivos reais exigem o IP real. No iOS simulador ou web local você também pode usar `http://localhost:8080` se o backend estiver na mesma máquina.
- Em produção, defina `EXPO_PUBLIC_API_URL` para o endpoint público do backend. Caso a variável não esteja presente, o helper cai em `http://10.0.2.2:8080` apenas durante o desenvolvimento; em builds de produção sem a variável, ele lança erro para evitar apontar para o backend errado.

#### Liberando CORS para o Expo

- Ao testar pelo Expo na web, o navegador usa a porta `8081` (`http://localhost:8081`) como origem. Adicione esse endereço (e outros domínios que você usar, como `http://192.168.0.134:8081` quando acessar pela rede) na configuração de CORS do seu backend Spring Boot.
- Um exemplo seria ajustar o `allowedOrigins` em `CorsConfig`:

  ```java
  registry.addMapping("/**")
          .allowedOrigins(
              "http://192.168.0.134:8080",
              "http://192.168.0.134:8081",
              "http://localhost:3000",
              "http://localhost:8081",
              "capacitor://localhost",
              "ionic://localhost"
          )
          .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
          .allowedHeaders("*")
          .exposedHeaders("Authorization","Location")
          .allowCredentials(true)
          .maxAge(3600);
  ```

- Reinicie o backend após alterar a configuração. Sem expor o cabeçalho `Access-Control-Allow-Origin` correspondente, navegadores bloquearão a requisição antes mesmo de chegar na API.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
