// src/lib/payment.js

// 1. Object format so Pricing.jsx can look up plans by ID (e.g., PLANS['pro'])
export const PLANS = {
  free: {
    name: 'Free',
    price: '0',
    period: '',
    description: 'Basic insights for small fields.',
    features: [
      '3 analyses / month',
      'Basic fertility score',
      'Top-1 crop recommendation',
    ],
  },
  starter: {
    name: 'Starter',
    price: '4.99',
    period: '/month',
    description: 'For growing farms needing regular insights.',
    features: [
      '30 analyses / month',
      'Full metrics & pH estimate',
      'Top-3 crop recommendations',
      'Cultivation calendar',
    ],
  },
  pro: {
    name: 'Pro',
    price: '12.99',
    period: '/month',
    description: 'Unlimited power for serious farmers.',
    popular: true,
    features: [
      'Unlimited analyses',
      'Everything in Starter',
      'Season-long rotation plan',
      'Exportable PDF report',
      'Priority support',
    ],
  }
}

export const PLAN_LIMITS = {
  free: { analysesPerMonth: 3 },
  starter: { analysesPerMonth: 30 },
  pro: { analysesPerMonth: Infinity },
}

export function openCheckout(planId) {
  // PASTE YOUR WAVE PAYMENT LINKS HERE
  const WAVE_LINKS = {
    starter: 'https://pay.wave.com/m/YOUR_STARTER_LINK_HERE',
    pro: 'https://pay.wave.com/m/YOUR_PRO_LINK_HERE',
  }

  const url = WAVE_LINKS[planId]
  
  if (!url || url.includes('YOUR_')) {
    return false 
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}