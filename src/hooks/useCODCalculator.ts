import { useMemo } from 'react';

interface CODCalculation {
  codFee: number;
  isFreeShipping: boolean;
  estimatedDelivery: string;
  isEligible: boolean;
  message?: string;
}

interface CODConfig {
  freeThreshold: number;
  baseFee: number;
  provinceFees: Record<string, number>;
  maxOrderValue: number;
  deliveryDays: Record<string, { min: number; max: number }>;
}

const defaultCODConfig: CODConfig = {
  freeThreshold: 5000,
  baseFee: 150,
  provinceFees: {
    'Western': 0,
    'Central': 50,
    'Southern': 100,
    'Northern': 200,
    'Eastern': 200,
    'North Western': 150,
    'North Central': 150,
    'Uva': 150,
    'Sabaragamuwa': 100
  },
  maxOrderValue: 50000,
  deliveryDays: {
    'Western': { min: 1, max: 2 },
    'Central': { min: 2, max: 3 },
    'Southern': { min: 2, max: 3 },
    'Northern': { min: 3, max: 5 },
    'Eastern': { min: 3, max: 5 },
    'North Western': { min: 2, max: 3 },
    'North Central': { min: 2, max: 4 },
    'Uva': { min: 2, max: 4 },
    'Sabaragamuwa': { min: 2, max: 3 }
  }
};

export const useCODCalculator = (
  orderValue: number,
  province: string,
  config: Partial<CODConfig> = {}
): CODCalculation => {
  const finalConfig = { ...defaultCODConfig, ...config };

  return useMemo(() => {
    // Check if order value exceeds maximum allowed for COD
    if (orderValue > finalConfig.maxOrderValue) {
      return {
        codFee: 0,
        isFreeShipping: false,
        estimatedDelivery: 'N/A',
        isEligible: false,
        message: `COD not available for orders above LKR ${finalConfig.maxOrderValue.toLocaleString()}`
      };
    }

    // Check if order qualifies for free COD
    const isFreeShipping = orderValue >= finalConfig.freeThreshold;
    
    // Calculate COD fee
    let codFee = 0;
    if (!isFreeShipping) {
      const provinceFee = finalConfig.provinceFees[province] || finalConfig.provinceFees['Central'];
      codFee = finalConfig.baseFee + provinceFee;
    }

    // Calculate estimated delivery
    const deliveryRange = finalConfig.deliveryDays[province] || finalConfig.deliveryDays['Central'];
    const estimatedDelivery = deliveryRange.min === deliveryRange.max 
      ? `${deliveryRange.min} ${deliveryRange.min === 1 ? 'day' : 'days'}`
      : `${deliveryRange.min}-${deliveryRange.max} days`;

    return {
      codFee,
      isFreeShipping,
      estimatedDelivery,
      isEligible: true
    };
  }, [orderValue, province, finalConfig]);
};

export default useCODCalculator;