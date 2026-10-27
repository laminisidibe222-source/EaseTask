import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    greeting: 'Hello, Farmer',
    welcome: 'Upload a photo of your land to get a fertility report & cultivation plan.',
    newAnalysis: 'New analysis',
    recommendedCrops: 'Recommended Crops',
    freePlan: 'Free plan',
    upgrade: 'Upgrade',
    analysisReport: 'Analysis Report',
    fertilityIndex: 'Fertility Index',
    moderatelyFertile: 'Moderately fertile',
    estimatedPH: 'Estimated pH',
    ideal: 'ideal',
    soilMetrics: 'Soil & Field Metrics',
    organicMatter: 'Organic Matter',
    moistureLevel: 'Moisture Level',
    vegetationCover: 'Vegetation Cover',
    cropVigor: 'Crop Vigor',
    recommendations: 'Recommendations',
    recentAnalyses: 'Recent Analyses',
    noAnalyses: 'No analyses yet. Your reports will appear here.',
    quickTips: 'Quick Tips',
    tip1: 'Take photos in daylight, avoiding shadows.',
    tip2: 'Capture bare soil AND any existing vegetation.',
    tip3: 'For best results, analyze 2–3 spots per field and average.',
    tip4: 'Results are estimates — confirm with a lab test before large investment.',
    uploadTitle: 'Upload a photo of your field',
    uploadDesc: 'Drag & drop an image here, or click to browse. Take the photo in daylight, 1–2 m above the soil.',
    runAnalysis: 'Run Analysis',
    analyzing: 'Analyzing...',
    unlockPro: 'Unlock Pro',
    proDesc: 'Unlimited analyses, PDF export, and full rotation plans.',
    proPrice: '$12.99/mo',
    signIn: 'Sign In',
    signUp: 'Create an Account',
    email: 'Email',
    password: 'Password',
    welcomeBack: 'Welcome back',
    signInToContinue: 'Sign in to your EaseTask account to continue analyzing your land.',
    newToEaseTask: 'New to EaseTask?',
    createAccount: 'Create an account',
    alreadyHaveAccount: 'Already have an account?',
    signOut: 'Sign Out',
    demoMode: 'Demo mode — no real connection.',
    enableAuth: 'Add your keys to .env to enable real authentication.',
    language: 'Langue'
  },
  fr: {
    greeting: 'Bonjour, Agriculteur',
    welcome: 'Téléchargez une photo de votre terre pour obtenir un rapport de fertilité et un plan de culture.',
    newAnalysis: 'Nouvelle analyse',
    recommendedCrops: 'Cultures Recommandées',
    freePlan: 'Plan Gratuit',
    upgrade: 'Mettre à niveau',
    analysisReport: 'Rapport d\'Analyse',
    fertilityIndex: 'Indice de Fertilité',
    moderatelyFertile: 'Modérément fertile',
    estimatedPH: 'pH estimé',
    ideal: 'idéal',
    soilMetrics: 'Sol & Caractéristiques du Champ',
    organicMatter: 'Matière Organique',
    moistureLevel: 'Taux d\'Humidité',
    vegetationCover: 'Couverture Végétale',
    cropVigor: 'Vigueur des Cultures',
    recommendations: 'Recommandations',
    recentAnalyses: 'Analyses Récentes',
    noAnalyses: 'Aucune analyse pour l\'instant. Vos rapports apparaîtront ici.',
    quickTips: 'Conseils Rapides',
    tip1: 'Prenez les photos en lumière naturelle, sans ombres.',
    tip2: 'Photographiez le sol nu ET la végétation existante.',
    tip3: 'Pour de meilleurs résultats, analysez 2–3 endroits par champ et faites la moyenne.',
    tip4: 'Les résultats sont des estimations — confirmez avec un laboratoire avant tout investissement important.',
    uploadTitle: 'Télécharger une photo de votre champ',
    uploadDesc: 'Glissez-déposez une image ici, ou cliquez pour parcourir. Prenez la photo en lumière naturelle, à 1–2 m au-dessus du sol.',
    runAnalysis: 'Lancer l\'analyse',
    analyzing: 'Analyse en cours...',
    unlockPro: 'Passer à la version Pro',
    proDesc: 'Analyses illimitées, export PDF et plans de rotation complets.',
    proPrice: '12,99 $/mois',
    signIn: 'Se connecter',
    signUp: 'Créer un compte',
    email: 'E-mail',
    password: 'Mot de passe',
    welcomeBack: 'Bon retour',
    signInToContinue: 'Connectez-vous à votre compte EaseTask pour continuer à analyser votre terre.',
    newToEaseTask: 'Nouveau sur EaseTask ?',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Déjà un compte ?',
    signOut: 'Se déconnecter',
    demoMode: 'Mode démo — connexion réelle désactivée.',
    enableAuth: 'Ajoutez vos clés dans .env pour activer l\'authentification réelle.',
    language: 'Language'
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr') // Default to French ✅

  const t = (key) => translations[lang][key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)