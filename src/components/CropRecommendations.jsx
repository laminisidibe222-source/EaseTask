import { Wheat, Circle, Sprout, Droplets } from 'lucide-react'

const CropRecommendations = () => {
  const crops = [
    {
      id: 'maize',
      name: 'Maize',
      score: 100,
      icon: <Wheat size={22} className="text-amber-600" />
    },
    {
      id: 'onion',
      name: 'Onion',
      score: 110,
      icon: <Circle size={22} className="text-orange-500" />
    },
    {
      id: 'rice',
      name: 'Rice',
      score: 120,
      icon: <Sprout size={22} className="text-green-600" />
    },
    {
      id: 'watermelon',
      name: 'Watermelon',
      score: 90,
      icon: <Droplets size={22} className="text-emerald-500" />
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommended Crops</h3>
      
      <div className="grid gap-3">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                {crop.icon}
              </div>
              <span className="font-medium text-gray-800">{crop.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {crop.score}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CropRecommendations