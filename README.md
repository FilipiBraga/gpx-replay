# 🗺️ GPX Replay - Visualizador de Rotas

Um webapp React moderno para visualizar e animar suas rotas GPX, assim como no Strava!

## ✨ Funcionalidades

- ✅ Upload de arquivos GPX (drag & drop)
- 🗺️ Visualização da rota completa no mapa (OpenStreetMap + Leaflet)
- ▶️ Animação suave com bolinha percorrendo a rota
- ⏸ Controles de Play, Pausa e Reset
- 🚴 Controle de velocidade de animação (0.5x a 5x)
- 📊 Informações da rota (distância, pontos, duração estimada)
- 📍 Estatísticas em tempo real (velocidade, elevação, progresso)
- 🖱️ Barra de progresso interativa
- 📱 Design responsivo
- ⚛️ Construído com React 18 + Vite
- **🗺️ NOVO: Controle de camadas** (ciclofaixas, ciclovias, rodovias, parques)
- **🚴 NOVO: Construtor de rotas** com preferências (rápido, curto, ciclável, paisagem)
- **✏️ NOVO: Edição de rotas** (arraste pontos no mapa)
- **📈 NOVO: Perfil de elevação** com ganho/perda
- **📊 NOVO: Dados completos para ciclistasde** (elevação em tempo real, estatísticas)

## 🚀 Como Usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O webapp abrirá automaticamente em `http://localhost:5173`

### 3. Fazer upload do arquivo GPX

- Clique em "📁 Selecionar arquivo GPX" ou arraste o arquivo para o campo
- O arquivo será processado automaticamente

### 4. Controlar a animação

- **▶️ Play**: Inicia a animação da rota
- **⏸ Pausa**: Pausa a animação
- **▶️ Retomar**: Continua a animação pausada
- **↻ Reset**: Volta ao início
- **Velocidade**: Ajusta a velocidade de reprodução (0.5x a 5x)
- **Barra de Progresso**: Clique para ir para um ponto específico

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`. Para visualizar:

```bash
npm run preview
```

## 📊 Informações Exibidas

- **Nome da Rota**: Nome extraído do arquivo GPX
- **Pontos**: Quantidade de pontos de GPS na rota
- **Distância**: Distância total em km (calculada usando fórmula de Haversine)
- **Duração Estimada**: Tempo estimado baseado em 25 km/h médio
- **Velocidade Atual**: Velocidade calculada entre pontos
- **Elevação**: Elevação atual em metros
- **Progresso**: Percentual da rota completado

## 🗺️ Mapa

- Linha laranja: Sua rota
- Círculo verde: Ponto de início
- Círculo vermelho: Ponto de fim
- Bolinha laranja: Posição atual durante a animação

## 📝 Formato do Arquivo GPX

O arquivo deve estar em formato GPX padrão com:
- Track points (`<trkpt>`) ou
- Waypoints (`<wpt>`)

Exemplo mínimo:
```xml
<?xml version="1.0"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="40.7128" lon="-74.0060">
        <ele>10</ele>
      </trkpt>
      <trkpt lat="40.7580" lon="-73.9855">
        <ele>20</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

## 🛠️ Tecnologias Utilizadas

- **React 18**: UI framework
- **Vite**: Build tool e dev server
- **Leaflet.js**: Biblioteca de mapas
- **OpenStreetMap**: Dados do mapa
- **JavaScript moderno (ES6+)**: Lógica e utilitários

## 📁 Estrutura do Projeto

```
gpx-replay/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MapContainer.jsx
│   │   ├── FileUpload.jsx
│   │   ├── RouteInfo.jsx
│   │   ├── Controls.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Stats.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── LayerControl.jsx (NOVO)
│   │   ├── RouteBuilder.jsx (NOVO)
│   │   └── ElevationProfile.jsx (NOVO)
│   ├── utils/
│   │   ├── gpxParser.js
│   │   ├── calculations.js
│   │   ├── elevationService.js (NOVO)
│   │   └── routingService.js (NOVO)
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── NOVAS_FUNCIONALIDADES.md (NOVO)
```

## 🆕 Novas Funcionalidades Principais

### Controle de Camadas
Visualize ou oculte diferentes tipos de vias e áreas:
- 🚴 Ciclofaixas - Faixas separadas para ciclistas
- 🛣️ Ciclovias - Vias dedicadas para bicicletas
- 🛣️ Rodovias - Principais vias de circulação
- 🌳 Parques - Áreas verdes

### Construtor de Rotas
Crie rotas personalizadas com 5 preferências diferentes:
- ⚡ Mais Rápido
- 📏 Mais Curto
- ⚖️ Equilibrado
- 🚴 Ciclável
- 🌲 Paisagem

Basta desenhar pontos no mapa e a rota será calculada e otimizada automaticamente!

### Edição de Rotas
- Clique e arraste pontos da rota
- Edite a rota tanto no mapa quanto no menu
- Veja mudanças em tempo real

### Perfil de Elevação
Gráfico visual mostrando:
- Elevação mínima e máxima
- Ganho total de elevação
- Perda total de elevação
- Distribuição de altitude ao longo da rota

### Informações Completas para Ciclistas
Durante a animação, visualize em tempo real:
- Velocidade instantânea
- Elevação atual
- Progresso percentual
- Distância percorrida
- Tempo decorrido

Para mais detalhes, consulte [NOVAS_FUNCIONALIDADES.md](NOVAS_FUNCIONALIDADES.md)

## 🌐 Compatibilidade

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 📞 Suporte

Se encontrar problemas ou tiver sugestões, verifique:
1. Se o arquivo GPX é válido
2. Se o Node.js está instalado (versão 14+)
3. Se as dependências foram instaladas (`npm install`)
4. Se a internet está funcionando (necessária para carregar o mapa)

## 📄 Licença

Livre para uso pessoal e comercial

---

**Divirta-se remontando suas aventuras de bike! 🚴‍♂️**
