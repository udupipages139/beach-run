import { Request, Response } from 'express';
import { RegistrationService } from '../services/registrationService.js';

export const getAdminRegistrationsController = async (req: Request, res: Response) => {
  try {
    const { source, registrations } = await RegistrationService.getAllRegistrations();

    // Calculate Summary Statistics
    let totalRevenueINR = 0;
    let totalPaidCount = 0;
    let totalFreeCount = 0;
    let totalPendingCount = 0;
    const categoryStats: Record<string, { count: number; name: string; revenue: number }> = {};

    registrations.forEach((reg) => {
      if (reg.status === 'PAID') {
        totalPaidCount++;
        totalRevenueINR += reg.amountINR;
      } else if (reg.status === 'FREE') {
        totalFreeCount++;
      } else if (reg.status === 'PENDING') {
        totalPendingCount++;
      }

      if (!categoryStats[reg.categoryId]) {
        categoryStats[reg.categoryId] = {
          count: 0,
          name: reg.categoryName,
          revenue: 0
        };
      }
      categoryStats[reg.categoryId].count++;
      if (reg.status === 'PAID') {
        categoryStats[reg.categoryId].revenue += reg.amountINR;
      }
    });

    return res.status(200).json({
      success: true,
      source,
      stats: {
        totalRegistrations: registrations.length,
        totalPaidCount,
        totalFreeCount,
        totalPendingCount,
        totalRevenueINR,
        categoryStats
      },
      registrations
    });
  } catch (error: any) {
    console.error('[AdminController] Error fetching admin registrations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin registration records',
      details: error.message || 'Internal server error'
    });
  }
};
