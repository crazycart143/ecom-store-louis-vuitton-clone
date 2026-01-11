import { Metadata, ResolvingMetadata } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

// Fetch product data from MongoDB
async function getProduct(id: string) {
  const client = await clientPromise;
  const db = client.db();
  
  // Handle both ObjectId and custom handle/string IDs if applicable
  let query: any = {};
  if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
  } else {
      query.handle = id;
  }

  // Simple fetch first to see if it exists (for metadata)
  // For the full page, we might want the aggregation if we need details/images joined
  const product = await db.collection("Product").aggregate([
    {
        $match: query
    },
    {
        $lookup: {
            from: "Image",
            localField: "_id",
            foreignField: "productId",
            as: "images"
        }
    },
    {
        $lookup: {
            from: "Detail",
            localField: "_id",
            foreignField: "productId",
            as: "details"
        }
    }
  ]).next();

  if (!product) return null;

  // Transform for client
  return {
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId?.toString(),
    images: product.images.map((img: any) => ({ 
        ...img, 
        _id: img._id.toString(),
        productId: img.productId?.toString()
    })),
    details: product.details.map((d: any) => ({ 
        ...d, 
        _id: d._id.toString(),
        productId: d.productId?.toString()
    })),
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
    // Ensure we handle legacy 'image' field if it exists
    image: product.image || (product.images?.[0]?.url)
  } as any;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Louis Vuitton",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const productImage = product.image || "/images/og-default.jpg";

  return {
    title: `${product.name} | Louis Vuitton`,
    description: product.description || "Discover this exclusive Louis Vuitton product.",
    openGraph: {
      title: product.name,
      description: product.description,
      images: [productImage, ...previousImages],
      url: `https://louis-vuitton-clone.vercel.app/product/${id}`,
      type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: [productImage],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
