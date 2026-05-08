import axios from 'axios'

// API OSRM para roteamento
const OSRM_API = 'https://router.project-osrm.org/route/v1'

// Mapeamento de preferências para parâmetros OSRM
const preferenceMap = {
  fastest: { profile: 'car', overview: 'full' },
  shortest: { profile: 'car', overview: 'full' },
  balanced: { profile: 'car', overview: 'full' },
  cycling: { profile: 'bike', overview: 'full' },
  scenic: { profile: 'bike', overview: 'full' }
}

export async function buildRoute(points, preference = 'balanced') {
  try {
    if (!points || points.length < 2) {
      throw new Error('Mínimo 2 pontos necessários')
    }

    const config = preferenceMap[preference] || preferenceMap.balanced
    const coordinates = points.map(p => `${p.lon},${p.lat}`).join(';')

    // Usar OSRM com bike profile para rotas com bicicleta
    const profile = preference === 'cycling' || preference === 'scenic' ? 'bike' : 'car'
    
    const response = await axios.get(
      `${OSRM_API}/${profile}/${coordinates}`,
      {
        params: {
          overview: 'full',
          steps: true,
          geometries: 'geojson',
          continue_straight: true,
          annotations: 'distance,duration,speed'
        },
        timeout: 10000
      }
    )

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('Não foi possível calcular a rota')
    }

    const route = response.data.routes[0]
    
    // Converter coordenadas de volta para lat/lon
    const routePoints = []
    if (route.geometry && route.geometry.coordinates) {
      for (const coord of route.geometry.coordinates) {
        routePoints.push({
          lat: coord[1],
          lon: coord[0],
          ele: 0 // Será preenchido depois
        })
      }
    }

    // Extrair informações das etapas
    const steps = []
    if (route.legs) {
      for (const leg of route.legs) {
        if (leg.steps) {
          for (const step of leg.steps) {
            steps.push({
              distance: step.distance,
              duration: step.duration,
              instruction: step.maneuver?.type || 'continue',
              name: step.name || 'Sem nome',
              bearing: step.maneuver?.bearing_after || 0
            })
          }
        }
      }
    }

    return {
      points: routePoints,
      distance: route.distance / 1000, // Converter para km
      duration: route.duration / 60, // Converter para minutos
      steps: steps,
      preference: preference
    }
  } catch (err) {
    console.error('Erro ao calcular rota:', err)
    throw new Error('Erro ao calcular rota: ' + (err.response?.data?.message || err.message))
  }
}

export async function calculateRouteElevation(routePoints) {
  try {
    // Buscar elevação para todos os pontos
    const elevations = []
    const chunkSize = 100

    for (let i = 0; i < routePoints.length; i += chunkSize) {
      const chunk = routePoints.slice(i, i + chunkSize)
      const locations = chunk.map(p => `${p.lat},${p.lon}`).join('|')

      try {
        const response = await axios.get('https://api.opentopodata.org/v1/aster30m', {
          params: { locations },
          timeout: 10000
        })

        if (response.data.results) {
          elevations.push(...response.data.results.map(r => r.elevation))
        }
      } catch (err) {
        console.warn('Erro ao buscar elevação, usando zeros:', err)
        elevations.push(...chunk.map(() => 0))
      }
    }

    // Atualizar pontos com elevação
    return routePoints.map((p, idx) => ({
      ...p,
      ele: elevations[idx] || 0
    }))
  } catch (err) {
    console.error('Erro ao calcular elevação:', err)
    return routePoints
  }
}

export function formatRouteStep(step, index) {
  const instructions = {
    'turn': `Vire à ${step.bearing > 180 ? 'esquerda' : 'direita'} em ${step.name}`,
    'continue': `Continue em ${step.name}`,
    'arrive': 'Chegou ao destino',
    'depart': `Saia em ${step.name}`,
    'keep': `Siga à ${step.bearing > 180 ? 'esquerda' : 'direita'} em ${step.name}`,
    'uturn': `Faça retorno em ${step.name}`
  }

  return {
    number: index + 1,
    instruction: instructions[step.instruction] || step.instruction,
    distance: (step.distance / 1000).toFixed(2),
    duration: Math.round(step.duration / 60)
  }
}
