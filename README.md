# Cartão de Visita Virtual

Um sistema moderno e responsivo para criação de cartões de visita digitais personalizáveis.

## 🚀 Características

- **Interface Moderna**: Design limpo e elegante com animações suaves
- **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Personalização Completa**: Cores, temas, imagens e links customizáveis
- **Preview em Tempo Real**: Visualização instantânea das alterações
- **QR Code Automático**: Geração e download de QR codes
- **Compatibilidade NFC**: URLs compartilháveis para tags NFC
- **Arquitetura Modular**: Código organizado e fácil de manter

## 📁 Estrutura do Projeto

```
VisitaVirtual/
├── index.html              # Página inicial com hero section
├── editor.html             # Editor de cartão
├── card.html               # Visualização pública do cartão
├── demo.html               # Página de demonstração
├── styles/
│   ├── main.css            # Estilos principais e variáveis
│   ├── editor.css          # Estilos do editor
│   └── card.css            # Estilos da visualização do cartão
├── scripts/
│   ├── app.js              # Configuração principal e utilitários
│   ├── main.js             # Scripts da página inicial
│   ├── editor.js           # Lógica do editor
│   ├── preview.js          # Sistema de preview
│   ├── links.js            # Gerenciamento de links
│   ├── qr-generator.js     # Geração de QR codes
│   └── card-renderer.js    # Renderização do cartão
└── assets/
    ├── images/             # Imagens e logos
    └── icons/              # Ícones personalizados
```

## 🎨 Design System

### Paleta de Cores
- **Primária**: `#00BFFF` (Azul claro moderno)
- **Secundária**: `#EEE8AA` (Amarelo suave)
- **Fundo**: `#F8F9FA` (Cinza bem claro)
- **Texto**: `#1C1C1C` (Cinza escuro)

### Tipografia
- **Principal**: Poppins (Google Fonts)
- **Títulos**: Montserrat (Google Fonts)

### Temas Disponíveis
- Rosa: `linear-gradient(135deg, #FF6B9D, #C44569)`
- Azul: `linear-gradient(135deg, #00BFFF, #1E90FF)`
- Roxo: `linear-gradient(135deg, #8B5CF6, #A855F7)`
- Verde: `linear-gradient(135deg, #10B981, #059669)`

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, Animações, Variáveis CSS
- **JavaScript ES6+**: Vanilla JS modular
- **Font Awesome 6.0**: Ícones
- **Google Fonts**: Tipografia
- **QRCode.js**: Geração de QR codes
- **LocalStorage**: Persistência de dados

## 🚀 Como Usar

### 1. Página Inicial (`index.html`)
- Hero section com animações
- Apresentação das funcionalidades
- Botões de call-to-action

### 2. Editor (`editor.html`)
- **Aba Informações**: Dados pessoais e foto de perfil
- **Aba Design**: Temas e cores personalizadas
- **Aba Links**: Redes sociais e links customizados
- **Aba Preview**: Visualização em tempo real

### 3. Cartão (`card.html`)
- Visualização pública do cartão
- Layout responsivo
- Efeitos de interação

## 📱 Funcionalidades

### Editor de Cartão
- ✅ Campos para informações pessoais
- ✅ Upload de foto de perfil
- ✅ Seleção de temas de gradiente
- ✅ Cores personalizáveis
- ✅ Links customizados com ícones
- ✅ Preview em tempo real

### Geração e Compartilhamento
- ✅ URL única para cada cartão
- ✅ QR Code automático
- ✅ Download do QR Code
- ✅ Copiar link para área de transferência
- ✅ Compatibilidade com NFC

### Responsividade
- ✅ Design mobile-first
- ✅ Breakpoints otimizados
- ✅ Touch-friendly em dispositivos móveis

## 🔧 Configuração e Desenvolvimento

### Pré-requisitos
- Navegador moderno com suporte a ES6+
- Servidor web local (opcional, mas recomendado)

### Estrutura Modular
O projeto foi desenvolvido com arquitetura modular para facilitar manutenção e expansão:

- **Separação de responsabilidades**: Cada script tem uma função específica
- **Variáveis CSS**: Fácil customização de cores e espaçamentos
- **Event delegation**: Performance otimizada
- **LocalStorage**: Persistência sem backend

### Próximas Funcionalidades
- [ ] Backend integration (Node.js/Firebase/Supabase)
- [ ] Sistema de usuários e autenticação
- [ ] Analytics de visualizações
- [ ] Templates pré-definidos
- [ ] Exportação em PDF
- [ ] Integração com APIs de redes sociais

## 🌐 Compatibilidade

- **Navegadores**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Dispositivos**: Desktop, Tablet, Mobile
- **Funcionalidades**: LocalStorage, Canvas API, File API, Clipboard API

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do GitHub.

---

**Desenvolvido com ❤️ para facilitar networking digital**