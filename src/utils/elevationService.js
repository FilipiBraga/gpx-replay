import axios from 'axios'

// API para obter elevação
const ELEVATION_API = 'https://api.opentopodata.org/v1/aster30m'

export async function getElevationData(points) {
  try {
    // Construir localizações no formato da API
    const locations = points.map(p => `${p.lat},${p.lon}`).join('|')
    
    // Chamar API em chunks (máx 100 pontos por requisição)
    const chunkSize = 100
    const chunks = []
    
    for (let i = 0; i < points.length; i += chunkSize) {
      const chunk = points.slice(i, i + chunkSize)
      const chunkLocations = chunk.map(p => `${p.lat},${p.lon}`).join('|')
      
      try {
        const response = await axios.get(ELEVATION_API, {
          params: {
            locations: chunkLocations
          },
          timeout: 10000
        })
        
        if (response.data.results) {
          chunks.push(...response.data.results.map(r => r.elevation))
        }
      } catch (err) {
        console.warn('Erro ao buscar elevação:', err)
        // Retornar valores estimados se falhar
        return points.map((p, idx) => p.ele || 0)
      }
    }
    
    return chunks.length > 0 ? chunks : points.map(p => p.ele || 0)
  } catch (err) {
    console.error('Erro ao processar elevação:', err)
    // Fallback: usar valores do GPX se houver
    return points.map(p => p.ele || 0)
  }
}

// Função auxiliar para calcular ganho/perda de elevação
export function calculateElevationStats(elevationData) {
  if (!elevationData || elevationData.length < 2) {
    return { gain: 0, loss: 0, min: 0, max: 0 }
  }

  let totalGain = 0
  let totalLoss = 0
  let min = elevationData[0]
  let max = elevationData[0]

  for (let i = 1; i < elevationData.length; i++) {
    const diff = elevationData[i] - elevationData[i - 1]
    if (diff > 0) {
      totalGain += diff
    } else {
      totalLoss += Math.abs(diff)
    }
    
    min = Math.min(min, elevationData[i])
    max = Math.max(max, elevationData[i])
  }

  return {
    gain: totalGain,
    loss: totalLoss,
    min,
    max,
    average: elevationData.reduce((a, b) => a + b, 0) / elevationData.length
  }
}
