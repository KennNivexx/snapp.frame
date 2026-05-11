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
        category: p.category.name,
        duration: p.duration || "",
        photoCount: p.photoCount || "",
        features: p.features || [],
        isPopular: p.isPopular || false,
        sortOrder: p.sortOrder || 0,
        isActive: p.isActive
      }))
    };
  } catch (error: any) {
    console.error("Prisma getProducts Error:", error);
    return { success: false, error: error.message };
  }
}
export async function createProduct(data: {
  name: string;
  sku: string;
  price: number;
  categoryName: string;
  image?: string;
  duration?: string;
  photoCount?: string;
  features?: string[];
  isPopular?: boolean;
  sortOrder?: number;
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
        stock: 999,
        categoryId: category.id,
        image: data.image,
        duration: data.duration,
        photoCount: data.photoCount,
        features: data.features || [],
        isPopular: data.isPopular || false,
        sortOrder: data.sortOrder || 0,
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
  duration?: string;
  photoCount?: string;
  features?: string[];
  isPopular?: boolean;
  sortOrder?: number;
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
        duration: data.duration,
        photoCount: data.photoCount,
        features: data.features,
        isPopular: data.isPopular,
        sortOrder: data.sortOrder,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedProductsFromStatic() {
  try {
    const { packages } = await import("@/data/packages");
    
    // Check if already seeded
    const count = await prisma.product.count();
    if (count > 5) return { success: true, message: "Already seeded or products exist" };

    // Get or create "Paket Foto" category
    let category = await prisma.category.findFirst({
      where: { name: "Paket Foto" }
    });

    if (!category) {
      category = await prisma.category.create({
        data: { 
          name: "Paket Foto",
          slug: "paket-foto"
        }
      });
    }

    for (const p of packages) {
      await prisma.product.upsert({
        where: { sku: p.id },
        update: {
          name: p.name,
          price: p.price,
          duration: p.duration,
          photoCount: p.photoCount,
          features: p.features,
          isPopular: p.isPopular || false,
          sortOrder: p.sortOrder || 0,
        },
        create: {
          sku: p.id,
          name: p.name,
          price: p.price,
          stock: 999,
          categoryId: category.id,
          duration: p.duration,
          photoCount: p.photoCount,
          features: p.features,
          isPopular: p.isPopular || false,
          sortOrder: p.sortOrder || 0,
        }
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/kasir");
    revalidatePath("/");
    return { success: true, message: "Products seeded successfully" };
  } catch (error: any) {
    console.error("seedProducts Error:", error);
    return { success: false, error: error.message };
  }
}
