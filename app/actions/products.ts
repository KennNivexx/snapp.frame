"use server";

import { prisma } from "@/lib/prisma";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true }
    });
    
    return {
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        image: p.image,
        category: p.category.name
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
