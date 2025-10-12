# 🎨 Editor de Cartão de Visita Virtual

## 📋 Funcionalidades Implementadas

### ✅ Layout de Duas Colunas
- **Lado Esquerdo**: Painel de edição completo com todos os controles
- **Lado Direito**: Preview em tempo real simulando um dispositivo móvel
- Design responsivo que se adapta a diferentes tamanhos de tela

### ✅ Painel de Edição
1. **Informações Pessoais**
   - Campo de nome completo
   - Campo de cargo/área de atuação
   - Campo de descrição curta
   - Campo de e-mail

2. **Upload de Foto de Perfil**
   - Suporte a drag & drop
   - Validação de tipo de arquivo (JPG, PNG, WebP)
   - Validação de tamanho (máximo 5MB)
   - Preview da imagem selecionada
   - Opção de remover imagem

3. **Personalização Visual**
   - 6 temas de fundo com gradientes:
     - Rosa (gradient-pink)
     - Azul (gradient-blue)
     - Roxo (gradient-purple)
     - Verde (gradient-green)
     - Laranja (gradient-orange)
     - Verde-azulado (gradient-teal)
   - Seletor de cor principal para botões
   - Aplicação em tempo real das mudanças

4. **Gerenciamento de Links**
   - Adicionar/editar/remover links personalizados
   - Tipos pré-definidos: Instagram, TikTok, YouTube, WhatsApp, Telegram, LinkedIn, Twitter, Facebook, Loja, Portfólio, Website, Personalizado
   - Campo de título personalizado
   - Campo de URL
   - Seletor de cor individual para cada botão
   - Ícones automáticos baseados no tipo

### ✅ Preview em Tempo Real
- **Simulação de Dispositivo Móvel**: Preview com formato de smartphone (360x640px)
- **Atualização Instantânea**: Todas as mudanças são refletidas imediatamente
- **Efeitos Visuais**: Transições suaves e animações
- **Placeholders**: Textos de exemplo quando campos estão vazios
- **Design Responsivo**: Adapta-se ao conteúdo

### ✅ Funcionalidades Técnicas
- **Salvamento Automático**: Dados salvos no localStorage
- **Geração de Cartão**: Criação de URL única e QR Code
- **Validação**: Campos obrigatórios (nome e e-mail)
- **Notificações**: Feedback visual para ações do usuário
- **Exportação**: Download do QR Code em PNG

## 🎯 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **Tailwind CSS**: Framework CSS via CDN para estilização moderna
- **JavaScript ES6+**: Lógica interativa e gerenciamento de estado
- **Font Awesome**: Ícones
- **QRCode.js**: Geração de QR Codes
- **Google Fonts**: Tipografia (Poppins e Inter)

## 🚀 Como Usar

1. **Acesse o Editor**: Abra `editor.html` no navegador
2. **Preencha as Informações**: Complete os campos pessoais
3. **Adicione uma Foto**: Faça upload da sua foto de perfil
4. **Escolha o Tema**: Selecione um dos 6 temas disponíveis
5. **Personalize as Cores**: Ajuste a cor principal dos botões
6. **Adicione Links**: Crie botões para suas redes sociais e sites
7. **Veja o Preview**: Observe as mudanças em tempo real
8. **Gere o Cartão**: Clique em "Gerar Cartão" para criar o QR Code

## 📱 Características do Preview

- **Formato Mobile**: Simula um smartphone com bordas arredondadas
- **Gradientes**: Fundos com gradientes suaves e modernos
- **Tipografia**: Fontes Poppins e Inter para melhor legibilidade
- **Interatividade**: Hover effects e transições suaves
- **Responsividade**: Adapta-se ao conteúdo dinamicamente

## 🎨 Temas Disponíveis

1. **Rosa**: Gradiente rosa vibrante
2. **Azul**: Gradiente azul profissional
3. **Roxo**: Gradiente roxo elegante
4. **Verde**: Gradiente verde natural
5. **Laranja**: Gradiente laranja energético
6. **Verde-azulado**: Gradiente teal moderno

## 🔧 Estrutura do Código

```
scripts/editor.js
├── Estado Global (appState)
├── Utilitários (loadSavedData, saveData, showNotification)
├── Informações Pessoais (initializePersonalInfo)
├── Design (initializeDesign, initializeThemes, initializeColors)
├── Upload de Imagem (initializeImageUpload, handleImageFile)
├── Gerenciamento de Links (initializeLinks, addNewLink, removeLink)
├── Ações (initializeActions, generateCard, saveCard)
└── Preview (updatePreview, generateCardContent, getSocialIcon)
```

## 🌟 Destaques da Implementação

- **Preview em Tempo Real**: Atualização instantânea sem recarregar a página
- **Interface Intuitiva**: Design limpo e organizado com Tailwind CSS
- **Validação Robusta**: Verificação de tipos de arquivo e tamanhos
- **Persistência de Dados**: Salvamento automático no localStorage
- **Responsividade**: Funciona em desktop, tablet e mobile
- **Acessibilidade**: Labels adequados e navegação por teclado
- **Performance**: Código otimizado e carregamento rápido

## 🎯 Próximos Passos

A página está pronta para integração com backend (Node.js ou Firebase) e pode ser facilmente expandida com:
- Autenticação de usuários
- Banco de dados para armazenamento
- Compartilhamento via redes sociais
- Analytics de visualizações
- Templates adicionais
- Exportação em PDF

---

**Status**: ✅ **COMPLETO** - Todas as funcionalidades solicitadas foram implementadas com sucesso!
