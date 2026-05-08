export function parseGPX(gpxString) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(gpxString, 'text/xml')

  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Arquivo GPX inválido')
  }

  const trkpts = xmlDoc.getElementsByTagName('trkpt')
  const wpts = xmlDoc.getElementsByTagName('wpt')
  const points = []

  // Coletar pontos de track
  for (let i = 0; i < trkpts.length; i++) {
    const trkpt = trkpts[i]
    points.push({
      lat: parseFloat(trkpt.getAttribute('lat')),
      lon: parseFloat(trkpt.getAttribute('lon')),
      ele: parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent || 0),
      time: trkpt.getElementsByTagName('time')[0]?.textContent
    })
  }

  // Se não houver track, tentar waypoints
  if (points.length === 0) {
    for (let i = 0; i < wpts.length; i++) {
      const wpt = wpts[i]
      points.push({
        lat: parseFloat(wpt.getAttribute('lat')),
        lon: parseFloat(wpt.getAttribute('lon')),
        ele: parseFloat(wpt.getElementsByTagName('ele')[0]?.textContent || 0),
        time: wpt.getElementsByTagName('time')[0]?.textContent
      })
    }
  }

  // Obter nome
  const name = xmlDoc.getElementsByTagName('name')[0]?.textContent || 'Rota sem nome'

  return { points, name }
}
