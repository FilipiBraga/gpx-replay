# GPX Replay - Guia de Novas Funcionalidades

## 🎯 Funcionalidades Adicionadas

### 1. **Controle de Camadas do Mapa** 🗺️
- **Ciclofaixas**: Visualize faixas separadas para ciclistas
- **Ciclovias**: Visualize vias dedicadas para bicicletas
- **Rodovias**: Visualize principais vias de circulação
- **Parques**: Visualize áreas verdes

Localizado no painel esquerdo, você pode ativar/desativar cada camada clicando nos checkboxes.

### 2. **Construtor de Rotas** 🚴
Crie rotas personalizadas com diferentes preferências:

#### Opções de Preferência:
- **⚡ Mais Rápido**: Prioriza velocidade
- **📏 Mais Curto**: Prioriza distância mínima
- **⚖️ Equilibrado**: Balanço entre velocidade e distância
- **🚴 Ciclável**: Otimizado para bicicletas
- **🌲 Paisagem**: Prioriza rotas com paisagens

#### Como Usar:
1. Selecione a preferência desejada
2. Clique em "✏️ Desenhar" para ativar o modo de desenho
3. Clique no mapa para adicionar pontos
4. Duplo-clique para finalizar
5. Clique em "✓ Acabar" para calcular a rota otimizada

### 3. **Edição de Rotas** ✏️
- Clique e arraste os pontos da rota para ajustar
- A rota é recalculada automaticamente
- Modifique no mapa ou no painel lateral

### 4. **Perfil de Elevação** 📊
Visualize um gráfico interativo da elevação ao longo da rota com:
- **Min**: Elevação mínima
- **Max**: Elevação máxima
- **Ganho**: Elevação total subida (+)
- **Perda**: Elevação total descida (-)

O gráfico mostra o perfil completo da rota, ajudando você a planejar melhor a pedalada.

### 5. **Informações para Ciclistas** 🚴‍♂️
Durante a animação/replay, você visualiza em tempo real:
- **Velocidade Atual**: Velocidade instantânea
- **Elevação**: Altitude atual
- **Progresso**: Percentual da rota completado
- **Distância**: Distância percorrida
- **Tempo**: Tempo decorrido

## 🛠️ Tecnologias Utilizadas

### Novas Dependências:
- **leaflet-draw**: Desenho de rotas no mapa
- **leaflet-routing-machine**: Cálculo de rotas otimizadas
- **leaflet-editable**: Edição de rotas arrastar e soltar
- **axios**: Requisições HTTP para APIs de elevação e routing

### APIs Integradas:
- **OSRM (Open Source Routing Machine)**: Cálculo de rotas
- **OpenTopoData**: Dados de elevação
- **OpenStreetMap**: Dados base do mapa

## 📝 Como Usar as Novas Funcionalidades

### Trabalho com Rotas GPX Existentes:
1. Faça upload de um arquivo GPX
2. Visualize a rota no mapa
3. Veja o perfil de elevação
4. Use os controles de Play/Pausa para replay

### Criar Uma Nova Rota:
1. Vá para "Construtor de Rota"
2. Selecione a preferência (ex: "🚴 Ciclável")
3. Clique "✏️ Desenhar"
4. Clique em pontos no mapa para traçar
5. Duplo-clique para finalizar
6. Clique "✓ Acabar" para calcular
7. Veja o resultado com elevação e estatísticas

### Controlar Camadas:
1. Abra "Camadas do Mapa"
2. Clique nos checkboxes para mostrar/ocultar
3. Combine diferentes camadas para visualizar:
   - Ciclofaixas + Ciclovias para rotas seguras
   - Parques para rotas paisagísticas
   - Rodovias para rotas rápidas

## 🎨 Interface do Usuário

### Painel Lateral (Sidebar):
- Upload de GPX
- Informações da Rota
- Controles de Play/Pausa/Reset
- **NOVO**: Camadas do Mapa
- **NOVO**: Construtor de Rotas
- **NOVO**: Perfil de Elevação

### Mapa Interativo:
- Arraste pontos para editar
- Clique para criar novas rotas
- Visualize camadas personalizadas
- Amplie/reduza com zoom

## 📊 Dados Disponíveis

### Por Rota:
- Distância total (km)
- Duração estimada
- Número de pontos
- Elevação máxima/mínima
- Ganho/perda de elevação

### Em Tempo Real (durante replay):
- Velocidade (km/h)
- Elevação atual (m)
- Progresso (%)
- Tempo decorrido

## ⚙️ Configuração

Todas as funcionalidades usam APIs públicas e gratuitas:
- OSRM público: sem autenticação
- OpenTopoData: limite de 100 requisições/IP/dia
- OpenStreetMap: dados abertos

Para uso intensivo, considere:
- Implementar limite de cache
- Usar serviços privados de OSRM
- Fazer deploy de OpenTopoData localmente

## 🐛 Troubleshooting

### Erro ao buscar elevação:
- Pode ocorrer com muitos pontos
- Sistema fallback usa dados do GPX
- Tente novamente em alguns minutos

### Erro ao calcular rota:
- Verifique se os pontos estão em uma área com dados de routing
- Use apenas 2-3 pontos para teste
- Tente outra preferência de rota

### Mapa não carrega:
- Verifique conexão com internet
- Limpe cache do navegador
- Recarregue a página

## 🚀 Próximas Melhorias Possíveis

- [ ] Salvar rotas em arquivo GPX
- [ ] Compartilhar rotas via link
- [ ] Histórico de rotas favoritas
- [ ] Perfil do ciclista (peso, capacidade)
- [ ] Estimativa de calorias queimadas
- [ ] Tempo estimado por preferência
- [ ] Modo noturno
- [ ] Modo offline com dados armazenados
- [ ] Integração com Strava

---

**Divirta-se planejando e remontando suas aventuras de bike! 🚴‍♂️**
