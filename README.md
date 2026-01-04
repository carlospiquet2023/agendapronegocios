# 📅 Agenda Pro Negócios

Sistema completo de gestão para pequenos negócios - oficinas, salões, barbearias e autônomos.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-Proprietária-red)
![Status](https://img.shields.io/badge/status-Pronto%20para%20Uso-green)

## 🚀 Funcionalidades

### 📅 Agenda

- Calendário visual interativo
- Visualização por dia, semana e mês
- Gerenciamento de agendamentos
- Status: Pendente, Confirmado, Concluído, Cancelado

### 👥 Clientes

- Cadastro completo de clientes
- Histórico de visitas
- Busca e filtros
- Contato rápido via WhatsApp

### 🔧 Serviços

- Catálogo de serviços
- Preços e tempo de duração
- Ícones personalizados
- Estatísticas de uso

### 💰 Financeiro

- Controle de receitas e despesas
- Categorização
- Filtros por período
- Saldo e balanço

### 📊 Relatórios

- Exportação em CSV, JSON e PDF
- Relatórios de clientes, serviços, agendamentos e finanças
- Backup completo dos dados

### 📱 Extras

- **PWA**: Instale como app no celular
- **Offline**: Funciona sem internet
- **WhatsApp**: Envie lembretes e mensagens
- **Backup**: Exporte e restaure seus dados

## 💻 Tecnologias

- HTML5
- CSS3 (Design System com variáveis)
- JavaScript ES6+ (Vanilla)
- LocalStorage (armazenamento local)
- Service Worker (PWA)

## 📂 Estrutura do Projeto

```text
agenda-pro-negocios/
├── index.html              # Aplicação principal
├── vendas.html             # Página de vendas (Hotmart)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── css/
│   ├── reset.css           # Reset CSS
│   ├── variables.css       # Variáveis e design tokens
│   ├── components.css      # Componentes UI
│   ├── layout.css          # Layout e estrutura
│   └── responsive.css      # Media queries
├── js/
│   ├── app.js              # Controlador principal
│   ├── utils/
│   │   ├── helpers.js      # Funções utilitárias
│   │   ├── storage.js      # Gerenciamento de dados
│   │   └── validators.js   # Validações
│   ├── components/
│   │   ├── modal.js        # Sistema de modais
│   │   └── toast.js        # Notificações
│   └── modules/
│       ├── clientes.js     # Módulo de clientes
│       ├── agenda.js       # Módulo de agenda
│       ├── servicos.js     # Módulo de serviços
│       ├── financeiro.js   # Módulo financeiro
│       ├── relatorios.js   # Módulo de relatórios
│       ├── dashboard.js    # Dashboard
│       ├── configuracoes.js # Configurações
│       └── whatsapp.js     # Integração WhatsApp
└── assets/
    └── icons/              # Ícones do PWA
```

## 🎯 Como Usar

### Instalação Local

1. Baixe todos os arquivos do projeto
2. Abra o arquivo `index.html` em um navegador
3. Ou hospede em um servidor web (recomendado para PWA)

### Hospedagem (para PWA funcionar)

Para o PWA funcionar corretamente (instalação no celular), hospede em:

- GitHub Pages
- Netlify
- Vercel
- Qualquer servidor com HTTPS

### Uso Básico

1. **Configure seu negócio** em Configurações
2. **Cadastre seus serviços** em Serviços
3. **Adicione clientes** em Clientes
4. **Crie agendamentos** em Agenda
5. **Acompanhe finanças** em Financeiro

## 📱 Instalação como App (PWA)

### No Android

1. Acesse o sistema pelo Chrome
2. Toque nos 3 pontinhos (menu)
3. Selecione "Adicionar à tela inicial"

### No iOS

1. Acesse o sistema pelo Safari
2. Toque no ícone de compartilhar
3. Selecione "Adicionar à Tela de Início"

## 💾 Backup e Restauração

### Fazer Backup

1. Vá em Configurações
2. Clique em "Fazer Backup"
3. Salve o arquivo JSON

### Restaurar

1. Vá em Configurações
2. Clique em "Restaurar Backup"
3. Selecione o arquivo JSON

## 🔒 Segurança

- **Dados Locais**: Todos os dados ficam no seu dispositivo
- **Privacidade**: Nenhum dado é enviado para servidores externos
- **Backup**: Faça backups regulares para não perder dados

## ⚠️ Importante

- Faça backup regularmente
- Não limpe os dados do navegador sem fazer backup
- Cada dispositivo tem seus próprios dados

## 📧 Suporte

Para dúvidas ou suporte, entre em contato através do email de suporte indicado na plataforma de compra.

## 📄 Licença

Este software está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

Copyright (c) 2026 Carlos Antonio de Oliveira Piquet

---

## 👨‍💻 Desenvolvedor

**Carlos Antonio de Oliveira Piquet**

- 🌐 GitHub: [@carlospiquet2023](https://github.com/carlospiquet2023)
- 📧 Contato: Através da plataforma de compra

---

Desenvolvido com ❤️ por **Carlos Antonio de Oliveira Piquet** para pequenos empreendedores brasileiros
