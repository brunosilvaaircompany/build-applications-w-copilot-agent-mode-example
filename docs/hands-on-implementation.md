# Registro de implementação do hands-on

Este arquivo registra os exercícios concretos das etapas 1 a 5 em `.github/steps/`, os comandos para prepará-los e validá-los e as limitações deste ambiente.

## Preparação do ambiente

Execute os comandos a partir da raiz do repositório:

```bash
npm ci --prefix octofit-tracker/backend
npm ci --prefix octofit-tracker/frontend
```

O Dev Container do exercício instala `mongodb-org` e inicia o serviço na porta `27017`; a API usa `8000` e o Vite usa `3000`. Encaminhe apenas as portas `3000` e `8000` como públicas e mantenha a `27017` privada.

Neste ambiente Windows, Node.js e npm estavam disponíveis, mas `mongod` e `mongosh` não estavam instalados. O Docker Desktop não estava em execução e as instruções de instalação do Dev Container (`apt-get`) são para o container Ubuntu, portanto não foi possível iniciar um MongoDB persistente local nem executar `npm run seed` contra ele. Os testes usam `mongodb-memory-server`; sua primeira execução baixou o binário de teste e verificou a seed duas vezes, inclusive a preservação de registros alheios. As dependências instalaram sem mudanças nos manifests; o npm reportou vulnerabilidades existentes e não foi executado `npm audit fix`.

## Etapa 1 — Arquitetura e linha de base

**Implementação:** decisões e plano de testes registrados em `docs/architecture.md`. A linha de base encontrou quatro falhas de validação de modelos e 15 falhas de interface; a seed já passou pelo teste de idempotência. O contrato de API não foi executado na linha de base porque o comando composto foi interrompido pela falha anterior nos testes de dados.

**Comandos possíveis:**

```bash
npm run test:data --prefix octofit-tracker/backend
npm run test:api --prefix octofit-tracker/backend
npm test --prefix octofit-tracker/frontend
node .github/scripts/grade-step.mjs step1-architecture
```

## Etapa 2 — Camada de dados

**Implementação:** os modelos Mongoose agora exigem os atributos essenciais e validam referências, duração, pontos e valores de domínio. O seed existente usa upserts estáveis e reconcilia a equipe anterior da pessoa de demonstração.

**Comandos:**

```bash
npm run test:data --prefix octofit-tracker/backend
npm run seed --prefix octofit-tracker/backend
npm run seed --prefix octofit-tracker/backend
```

**Validação:** `npm run test:data` passou (5 testes), incluindo duas chamadas à seed em MongoDB em memória e contagem idempotente. Os dois comandos `npm run seed` contra um MongoDB persistente não foram executados porque esse serviço não está disponível neste host.

**Ajuste do grader:** `step2-data` inicialmente exigia a palavra inglesa `idempotently`, mas o teste protegido está em português e usa `idempotente`. O matcher foi ajustado para aceitar os dois termos; o teste e os hashes dos contratos permaneceram intactos, e `node .github/scripts/grade-step.mjs step2-data` passou.

No Windows, o executor do grader chama diretamente os pontos de entrada JavaScript de Vitest, TypeScript e Vite pelo Node.js, sem shell. Nos demais sistemas, mantém os shims originais em `node_modules/.bin`.

**Comando de graduação:**

```bash
node .github/scripts/grade-step.mjs step2-data
```

## Etapa 3 — API Express

**Implementação:** serviços de atividades, equipes, placar e sugestões foram completados. Entradas inválidas retornam `400`; referências ou pessoas inexistentes retornam `404`.

**Comandos:**

```bash
npm run test:api --prefix octofit-tracker/backend
npm run dev --prefix octofit-tracker/backend
curl.exe http://localhost:8000/api/activities
curl.exe -i -X POST http://localhost:8000/api/activities -H "Content-Type: application/json" -d "{}"
```

**Validação:** `npm run test:api` passou (4 testes). Requisições manuais contra o servidor persistente não foram possíveis sem MongoDB local.

```bash
node .github/scripts/grade-step.mjs step3-api
```

## Etapa 4 — Interface React

**Implementação:** as quatro rotas carregam dados pelo cliente compartilhado, mostram conteúdo acessível e tratam carregamento, listas vazias e falhas da API em português do Brasil.

**Comandos:**

```bash
npm test --prefix octofit-tracker/frontend
npm run build --prefix octofit-tracker/frontend
npm run dev --prefix octofit-tracker/frontend -- --host 0.0.0.0
```

**Ajuste de validação:** a primeira execução após implementar as telas ainda falhou nos quatro casos de lista vazia porque os textos não correspondiam ao vocabulário esperado pelos contratos. As mensagens passaram a começar com “Sem”; a execução seguinte passou nos 15 testes. A inspeção manual no navegador depende da API e do MongoDB persistente, indisponíveis neste host.

```bash
node .github/scripts/grade-step.mjs step4-frontend
```

## Etapa 5 — Verificação integrada

**Comandos de verificação:**

```bash
npm run test:data --prefix octofit-tracker/backend
npm run test:api --prefix octofit-tracker/backend
npm test --prefix octofit-tracker/frontend
npm run build --prefix octofit-tracker/backend
npm run build --prefix octofit-tracker/frontend
node .github/scripts/grade-step.mjs step5-final
```

**Resultado:** `step1-architecture`, `step2-data`, `step3-api`, `step4-frontend` e `step5-final` passaram. O fechamento executou 5 testes de dados, 4 de API e 15 de frontend, além das compilações TypeScript e Vite. Os contratos protegidos não foram alterados.

O teste separado `node --test tests/exercise-validation.test.mjs` ainda aponta problemas preexistentes do template (alvo do badge no README, formatação do bloco na etapa 1, pin do toolkit no workflow inicial e gate de PR mesclada na etapa 5). Esses arquivos não fazem parte das implementações solicitadas e foram preservados.

Para a verificação manual completa em um Codespace preparado, carregue os dados com `npm run seed --prefix octofit-tracker/backend`, inicie API e frontend em terminais separados e percorra as quatro rotas na porta `3000`, incluindo um caminho de erro. A criação e a mesclagem de pull request também são atividades do exercício, não uma implementação local; não foram realizadas nesta sessão.
