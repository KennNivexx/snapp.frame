"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [transactionsToday, totalRevenue, totalCustomers, activeReferrals] = await Promise.all([
      prisma.transaction.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED" }
      }),
      prisma.user.count({
        where: { role: "CASHIER" } // Just a placeholder for customers if we don't have a separate table
      }),
      prisma.referralCode.count({
        where: { isActive: true }
      })
    ]);

    return {
      success: true,
      data: {
        bookingsToday: transactionsToday,
        revenue: totalRevenue._sum.total || 0,
        customers: totalCustomers,
        referrals: activeReferrals
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecentTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        cashier: { select: { name: true } },
        referralCode: { select: { code: true } }
      }
    });
    return { success: true, data: transactions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChartData() {
  try {
    // 1. Transaction Trends (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: "COMPLETED" },
      select: { createdAt: true, total: true }
    });

    const dailyTrends = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const dailyTotal = transactions
        .filter(t => new Date(t.createdAt).toDateString() === date.toDateString())
        .reduce((sum, t) => sum + 1, 0); 
      return { name: dateStr, value: dailyTotal };
    });

    const hasTrendData = dailyTrends.some(t => t.value > 0);
    const finalTrends = hasTrendData ? dailyTrends : dailyTrends.map(t => ({ ...t, value: 0.1 })); // Small value to show a flat gray line

    // 2. Service/Category Popularity
    const items = await prisma.transactionItem.findMany({
      include: { product: { include: { category: true } } }
    });

    const categoryCounts: Record<string, number> = {};
    items.forEach(item => {
      const catName = item.product.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const totalItems = items.length;
    const colors = ["#3B2211", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];
    
    let popularServices = [];
    if (totalItems > 0) {
      popularServices = Object.entries(categoryCounts).map(([name, count], i) => ({
        name,
        value: Math.round((count / totalItems) * 100),
        color: colors[i % colors.length]
      }));
    } else {
      popularServices = [{ name: "Belum Ada Data", value: 100, color: "#F0EFE9" }];
    }

    return {
      success: true,
      data: {
        trends: finalTrends,
        services: popularServices,
        hasTrendData
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

