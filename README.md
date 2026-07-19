# GLP-1 Tracker

App que **monta e acompanha dieta + treino** para quem usa GLP-1 (semaglutida,
tirzepatida, liraglutida etc.), com foco em **preservar massa magra** e mitigar
efeitos colaterais comuns (baixa ingestão de proteína, constipação).

> ⚠️ **Aviso:** as estimativas de calorias, macros e dose são educacionais e
> **não substituem** acompanhamento médico/nutricional. A titulação de GLP-1 é
> prescrição médica.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Prisma** + **PostgreSQL**
- Geradores de dieta/treino como **funções puras** (testáveis sem banco)

## Estrutura

```
prisma/
  schema.prisma          Modelo de dados (usuário, peso, medicação/titulação,
                         efeitos colaterais, dieta, treino, check-in diário)
  seed.ts                Popula catálogo de alimentos e exercícios
src/lib/
  types.ts               Tipos compartilhados
  nutrition.ts           Cálculo de metas (BMR/TDEE, proteína, fibra, água)
  slug.ts                IDs estáveis do catálogo (seed ↔ persistência)
  data/foods.ts          Catálogo de alimentos (macros por 100 g)
  data/exercises.ts      Catálogo de exercícios (foco em resistência)
  generators/
    dietGenerator.ts     Monta plano alimentar semanal a partir das metas
    workoutGenerator.ts  Monta treino semanal a partir do perfil/objetivo
  auth.ts                Configuração NextAuth (credentials + JWT)
  getCurrentUser.ts      Sessão/usuário atual (Server Components e rotas)
  persist.ts             Salva metas + dieta + treino no banco
  prisma.ts              Cliente Prisma (singleton)
src/components/          Formulários e navbar (client components)
app/
  manifest.ts            PWA (Web App Manifest)
  signin/ signup/        Autenticação
  (app)/                 Área logada (guarda de sessão + PWA + lembretes)
    dashboard/           Resumo: peso, metas, gráfico, próxima aplicação
    onboarding/          Completa o perfil (idade, altura, objetivo, metas)
    weight/              Registro + histórico + gráfico de evolução
    medication/          Aplicações de GLP-1 + efeitos colaterais
    checkin/             Check-in diário (energia, fome, humor, proteína)
    plan/                Editar plano: trocar alimentos/exercícios
    insights/            Adesão de proteína + fome × aplicação (observacional)
  api/
    auth/register/       Cadastro (valida e-mail único, senha ≥ 8)
    auth/[...nextauth]/  Handler NextAuth
    profile/             PUT → completa/atualiza o perfil
    plan/generate/       POST sem estado → gera metas + dieta + treino
    plan/save/           POST → gera E persiste para o usuário logado
    plan/meal-item/[id]/        PATCH/DELETE item de refeição
    plan/workout-exercise/[id]/ PATCH exercício do treino
    foods/ exercises/    GET catálogo (seletores de troca)
    reminders/           GET → aplicação/pesagem pendentes hoje
    weight/ injection/ side-effect/ checkin/   Registro de dados
public/
  sw.js                  Service worker (shell offline)
  icon.svg               Ícone do PWA
scripts/demo.ts          Demonstração da geração (roda sem banco)
```

## Segurança / escopo clínico

- O app **não recomenda nem ajusta dose** de GLP-1. Titulação é ato médico —
  o registro de aplicações é apenas um diário do que o usuário já faz.
- O gráfico "fome × aplicação" é **observacional** (mostra os dados do próprio
  usuário) e traz aviso explícito de não usá-lo para mudar dose.
- Disclaimers médicos em todas as telas logadas.

## Lembretes / PWA / Web Push

- Instalável (manifest + service worker com shell offline).
- Banner de lembretes ao abrir o app (aplicação/pesagem pendentes).
- **Web Push real** (funciona com o app fechado):
  - `web-push` + chaves **VAPID**.
  - Modelo `PushSubscription` guarda a assinatura por dispositivo.
  - `POST /api/push/subscribe` / `DELETE` — assina/cancela.
  - `GET /api/cron/reminders` — agendado (Vercel Cron em `vercel.json`, 09:00
    diário), protegido por `CRON_SECRET`; calcula pendências e envia o push.
  - O service worker trata os eventos `push` e `notificationclick`.

### Configurar o push

```bash
npm run vapid   # gera o par de chaves VAPID → copie para o .env
```

`.env` necessário:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."   # exposta ao navegador
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:voce@exemplo.com"
CRON_SECRET="..."                     # protege o endpoint de cron
```

No deploy (Vercel), o Cron injeta `Authorization: Bearer $CRON_SECRET`
automaticamente. Para testar localmente:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Fluxo do usuário: clicar em **Ativar notificações** no banner → concede permissão
e assina o push → o cron diário envia os lembretes.

## Fluxo do app

1. Cadastro/login (`/signup`, `/signin`).
2. Registrar peso (`/weight`) e a aplicação de GLP-1 (`/medication`).
3. No dashboard, clicar em **Gerar plano** → o app calcula as metas a partir do
   perfil + último peso + medicação ativa e persiste dieta e treino da semana.
4. Acompanhar com check-ins diários e novos registros de peso/efeitos.

## Como rodar

```bash
npm install
cp .env.example .env         # configure DATABASE_URL

# Ver a geração funcionando SEM precisar de banco:
npm run demo

# Com banco (PostgreSQL):
npm run prisma:push          # cria as tabelas
npm run seed                 # popula alimentos + exercícios
npm run dev                  # sobe o Next.js
```

### Exemplo de uso da API

```bash
curl -X POST http://localhost:3000/api/plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female", "age": 38, "heightCm": 165, "weightKg": 92,
    "targetWeightKg": 70, "activityLevel": "light",
    "goal": "preserve_muscle", "onGlp1": true, "daysPerWeek": 4
  }'
```

## Lógica de geração (resumo)

1. **Metas** (`nutrition.ts`): Mifflin-St Jeor → TDEE → déficit por objetivo.
   Proteína a **2,0 g/kg** (peso-alvo) quando em GLP-1; fibra reforçada; água a
   35 ml/kg. Há piso calórico de segurança.
2. **Dieta** (`dietGenerator.ts`): distribui calorias em 5 refeições menores
   (apetite reduzido), escolhe primeiro a fonte de proteína mais densa para
   cumprir a meta proteica, completa energia priorizando fibra e adiciona
   vegetais de volume no almoço/jantar. Rotaciona alimentos ao longo da semana.
3. **Treino** (`workoutGenerator.ts`): define dias/semana pelo nível de
   atividade, escolhe a divisão (corpo inteiro / superior-inferior), prioriza
   **musculação** e prescreve séries/reps/descanso pelo objetivo.

## Próximos passos sugeridos

- Autenticação (NextAuth) + persistir planos gerados em `MealPlan`/`WorkoutPlan`.
- Telas: dashboard de peso, registro de aplicação/efeitos, check-in diário.
- Lembretes (`Notification.scheduledFor`) de injeção e pesagem.
- Substituição de alimentos/exercícios pelo usuário.
