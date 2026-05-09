"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(includeInactive: boolean = false) {
  try {
    const products = await prisma.product.findMany({
      where: includeInactive ? {} : { isActive: true },
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
export async function createProduct(data: {
  name: string;
  sku: string;
  price: number;
  categoryName: string;
  image?: string;
}) {
  try {
    // Ensure category exists
    let category = await prisma.category.findFirst({
      where: { name: data.categoryName }
    });

    if (!category) {
      category = await prisma.category.create({
        data: { 
          name: data.categoryName,
          slug: data.categoryName.toLowerCase().replace(/\s+/g, '-')
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku || `PROD-${Date.now()}`,
        price: data.price,
        stock: 999, // Default stock for digital/service or unspecified
        categoryId: category.id,
        image: data.image,
        isActive: true,
      },
      include: { category: true }
    });

    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function updateProduct(id: string, data: {
  name?: string;
  sku?: string;
  price?: number;
  categoryName?: string;
  image?: string;
  isActive?: boolean;
}) {
  try {
    let categoryId = undefined;
    
    if (data.categoryName) {
      let category = await prisma.category.findFirst({
        where: { name: data.categoryName }
      });

      if (!category) {
        category = await prisma.category.create({
          data: { 
            name: data.categoryName,
            slug: data.categoryName.toLowerCase().replace(/\s+/g, '-')
          }
        });
      }
      categoryId = category.id;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        categoryId: categoryId,
        image: data.image,
        isActive: data.isActive,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
