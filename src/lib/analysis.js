/**
 * EaseTask on-device fertility analysis engine.
 *
 * Runs entirely in the browser (no backend ML required). It draws the
 * uploaded photo to a canvas, samples pixels, and derives agronomic proxies:
 *   - Greenness / vegetation cover (ExG index)
 *   - Soil organic-matter proxy (darkness of bare-soil pixels)
 *   - Moisture proxy (blue-channel / luminance ratio on soil)
 *   - Texture / roughness proxy (local luminance variance)
 *
 * These are heuristic estimates — clearly labelled as such in the UI.
 * For production-grade accuracy, plug a real vision API into `analyzeLand()`.
 */

const SAMPLE_SIZE = 128 // px — downscale target for fast pixel sampling

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Excess Green index — highlights live vegetation. */
function exg(r, g, b) {
  return 2 * g - r - b
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export async function analyzeLand(imageSrc, meta = {}) {
  const img = await loadImage(imageSrc)

  const canvas = document.createElement('canvas')
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(img.width, img.height))
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const total = data.length / 4

  let vegPixels = 0
  let soilPixels = 0
  let soilLumSum = 0
  let soilBlueRatioSum = 0
  let greennessSum = 0
  let lumSum = 0
  let lumSqSum = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const lum = luminance(r, g, b)
    lumSum += lum
    lumSqSum += lum * lum
    const gi = exg(r, g, b)
    greennessSum += gi

    if (gi > 25 && g > r && g > b) {
      vegPixels++
    } else if (r > 60 && r > b + 8 && Math.abs(r - g) < 60) {
      // bare-soil-ish pixel (warm brown, not sky/water)
      soilPixels++
      soilLumSum += lum
      soilBlueRatioSum += b / (lum + 1)
    }
  }

  const vegCover = Math.min(100, Math.round((vegPixels / total) * 100 * 2.2))
  const meanLum = lumSum / total
  const variance = lumSqSum / total - meanLum * meanLum
  const texture = Math.min(100, Math.round(Math.sqrt(Math.max(0, variance)) * 1.6))

  const avgSoilLum = soilPixels ? soilLumSum / soilPixels : 120
  // Darker soil → higher organic matter proxy (0..100)
  const organicMatter = Math.round(Math.min(100, Math.max(5, (1 - avgSoilLum / 220) * 130)))
  const avgBlueRatio = soilPixels ? soilBlueRatioSum / soilPixels : 0.3
  // Higher blue ratio relative to luminance suggests moisture / darker soil
  const moisture = Math.round(Math.min(100, Math.max(5, (avgBlueRatio - 0.18) * 420 + texture * 0.25)))
  const avgGreenness = greennessSum / total
  const vigor = Math.round(Math.min(100, Math.max(0, avgGreenness * 1.4 + 30)))

  // Composite fertility score 0..100
  const fertility = Math.round(
    Math.min(
      100,
      Math.max(
        5,
        organicMatter * 0.35 + moisture * 0.25 + vegCover * 0.2 + vigor * 0.15 + (100 - Math.abs(texture - 45)) * 0.05,
      ),
    ),
  )

  const level =
    fertility >= 75 ? 'Highly fertile' :
    fertility >= 55 ? 'Moderately fertile' :
    fertility >= 35 ? 'Low fertility — needs amendment' :
    'Poor — restoration recommended'

  const ph = +(5.8 + (organicMatter / 100) * 1.6 + (Math.random() * 0.4 - 0.2)).toFixed(1)

  return buildReport({ fertility, level, vegCover, organicMatter, moisture, texture, vigor, ph, meta })
}

/** Crops relevant to the Sudano-Sahelian / West-African climate (Senegal focus). */
const CROP_DB = [
  { id: 'millet', name: 'Pearl Millet (Milon)', water: 'low', ph: [5.5, 7.5], cycleDays: 90, fertilityMin: 30, emoji: '🌾' },
  { id: 'sorghum', name: 'Sorghum (Sorgho)', water: 'low', ph: [5.5, 7.5], cycleDays: 110, fertilityMin: 35, emoji: '🌾' },
  { id: 'groundnut', name: 'Groundnut (Arachide)', water: 'medium', ph: [5.8, 7.2], cycleDays: 120, fertilityMin: 45, emoji: '🥜' },
  { id: 'cowpea', name: 'Cowpea (Niébé)', water: 'low', ph: [5.5, 7.5], cycleDays: 75, fertilityMin: 30, emoji: '🫘' },
  { id: 'maize', name: 'Maize (Maïs)', water: 'high', ph: [5.8, 7.0], cycleDays: 100, fertilityMin: 55, emoji: '🌽' },
  { id: 'rice', name: 'Rainfed Rice (Riz)', water: 'high', ph: [5.5, 7.0], cycleDays: 120, fertilityMin: 50, emoji: '🍚' },
  { id: 'sesame', name: 'Sesame (Sésame)', water: 'low', ph: [5.5, 7.5], cycleDays: 95, fertilityMin: 40, emoji: '🌱' },
  { id: 'watermelon', name: 'Watermelon (Pastèque)', water: 'medium', ph: [6.0, 7.0], cycleDays: 90, fertilityMin: 50, emoji: '🍉' },
  { id: 'tomato', name: 'Tomato (Tomate)', water: 'high', ph: [6.0, 7.0], cycleDays: 80, fertilityMin: 60, emoji: '🍅' },
  { id: 'onion', name: 'Onion (Oignon)', water: 'medium', ph: [6.0, 7.5], cycleDays: 110, fertilityMin: 55, emoji: '🧅' },
]

function buildReport(metrics) {
  const { fertility, moisture, ph } = metrics

  const recommended = CROP_DB
    .filter(c => fertility >= c.fertilityMin && ph >= c.ph[0] && ph <= c.ph[1])
    .sort((a, b) => b.fertilityMin - a.fertilityMin)
    .slice(0, 4)

  const waterNeed = moisture >= 60 ? 'Rainfed may suffice; supplemental irrigation at flowering.' :
    moisture >= 35 ? 'Plan supplemental irrigation or zai / half-moon water harvesting.' :
    'Irrigation or strong water-harvesting (diguettes, zaï) is required.'

  const amendments = []
  if (metrics.organicMatter < 45) amendments.push('Incorporate compost or manure (2–4 t/ha) before sowing.')
  if (ph < 6.0) amendments.push('Apply dolomitic lime to raise pH toward 6.2–6.5.')
  if (ph > 7.2) amendments.push('Soil is alkaline — add organic matter and consider acidifying fertilizers.')
  if (moisture < 35) amendments.push('Build half-moons / stone bunds to capture runoff.')
  if (metrics.vegCover < 20) amendments.push('Plant a cover crop (cowpea / mucuna) in rotation to protect topsoil.')
  if (amendments.length === 0) amendments.push('Soil is in good condition — maintain with crop rotation and mulching.')

  const plan = [
    { week: 'Weeks 1–2', task: 'Land clearing & ploughing; incorporate amendments.', icon: 'shovel' },
    { week: 'Week 3', task: `Sow ${recommended[0]?.name.split('(')[0].trim() || 'millet'} at recommended density.`, icon: 'seed' },
    { week: 'Weeks 4–6', task: 'First weeding + thinning; monitor for pests.', icon: 'bug' },
    { week: 'Weeks 7–10', task: 'Second weeding; top-dress with NPK if available; irrigation as needed.', icon: 'droplet' },
    { week: `Week ~${recommended[0]?.cycleDays / 7 || 13}`, task: 'Harvest at maturity; dry & store; plan next rotation.', icon: 'scythe' },
  ]

  return {
    metrics,
    recommended,
    waterNeed,
    amendments,
    plan,
    analyzedAt: new Date().toISOString(),
  }
}

/** Read a File into a data URL. */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
