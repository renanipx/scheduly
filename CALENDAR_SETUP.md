# 📅 Configuração do Calendário

Este guia explica como configurar a integração com Google Calendar e Outlook Calendar para criar eventos automaticamente quando uma task for criada.

## 🚀 Funcionalidades

- **Google Calendar**: Cria eventos automaticamente no Google Calendar do usuário
- **Outlook Calendar**: Envia emails com arquivos .ics para importar no Outlook
- **Notificações**: Mostra confirmação quando o evento é criado com sucesso

## ⚙️ Configuração do Backend

### 1. Instalar Dependências

```bash
cd backend
npm install googleapis
```

### 2. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Google OAuth2 for Calendar
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-auth/calendar/callback

# Email Configuration (para Outlook)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### 3. Configurar Google OAuth2

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Calendar API
4. Configure as credenciais OAuth2:
   - Tipo: Aplicação Web
   - URIs autorizados: `http://localhost:5000`
   - URIs de redirecionamento: `http://localhost:5000/api/google-auth/calendar/callback`
5. Copie o Client ID e Client Secret para o arquivo `.env`

## 🎯 Como Usar

### 1. Configurar nas Configurações

1. Acesse a página de **Settings**
2. Em **Notifications**, marque "Enable Notifications"
3. Marque "Create a calendar event in the provided email"
4. Selecione o provedor:
   - **Google Calendar**: Clique em "Connect Google Calendar"
   - **Outlook Calendar**: Será usado automaticamente

### 2. Criar Tasks

Quando você criar uma task com data e horário:

- **Google Calendar**: O evento será criado automaticamente no seu Google Calendar
- **Outlook Calendar**: Você receberá um email com um arquivo .ics para importar

### 3. Notificações

Após criar uma task, você verá:
- ✅ Task created successfully! 📅 Calendar event created.

## 🔧 Estrutura do Código

### Backend

- `services/calendarService.js`: Serviço principal para criação de eventos
- `routes/google-auth.js`: Rotas para autenticação do Google
- `routes/tasks.js`: Atualizado para criar eventos automaticamente
- `models/User.js`: Adicionados campos para tokens do Google

### Frontend

- `pages/dashboard/Settings.js`: Interface para configurar calendário
- `pages/dashboard/Tasks.js`: Mostra notificações de calendário
- `components/AIAssistant.js`: Atualizado para mostrar notificações

## 🐛 Solução de Problemas

### Google Calendar não conecta

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a Google Calendar API está ativada
3. Verifique se os URIs de redirecionamento estão corretos

### Outlook não recebe emails

1. Verifique se EMAIL_USER e EMAIL_PASSWORD estão configurados
2. Use uma senha de aplicativo do Gmail (não a senha normal)
3. Verifique se o email não foi para spam

### Eventos não são criados

1. Confirme se a task tem data, hora de início e fim
2. Verifique se o calendário está configurado nas settings
3. Olhe os logs do backend para erros

## 📝 Exemplo de Uso

1. **Configurar Google Calendar**:
   ```
   Settings → Notifications → Calendar → Google Calendar → Connect Google Calendar
   ```

2. **Criar Task**:
   ```
   Tasks → New Task
   Title: Reunião com Cliente
   Date: 2024-01-15
   Start Time: 14:00
   End Time: 15:00
   ```

3. **Resultado**:
   - Task criada no sistema
   - Evento criado no Google Calendar
   - Notificação: "Task created successfully! 📅 Calendar event created."

## 🔒 Segurança

- Tokens do Google são armazenados de forma segura no banco de dados
- Apenas o usuário autenticado pode acessar seus próprios calendários
- Tokens são invalidados quando o usuário desconecta 