import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose"; // 1. Imported mongoose to access validation methods

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // 2. Validate route parameter structure before executing MongoDB queries
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product identifier format configuration" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("GET SINGLE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // 3. Validate route parameter structure before updating database entries
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product identifier format configuration" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      price,
      image,
      category,
      description,
      hasCustomization,
      customizations,
    } = body;

    if (!title || !price || !image || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required product fields" },
        { status: 400 }
      );
    }

    const normalizedCustomizations =
      hasCustomization && Array.isArray(customizations)
        ? customizations
            .map((group: any) => {
              const validOptions = Array.isArray(group.options)
                ? group.options.filter(
                    (option: any) => option.label && option.label.trim() !== ""
                  )
                : [];

              if (!group.name || group.name.trim() === "" || validOptions.length === 0) {
                return null;
              }

              let options = validOptions.map((option: any) => ({
                label: option.label.trim(),
                price: Number(option.price) || 0,
                isDefault: !!option.isDefault,
                spec1: option.spec1?.trim() || "",
                spec2: option.spec2?.trim() || "",
                spec3: option.spec3?.trim() || "",
              }));

              if (!options.some((option: any) => option.isDefault)) {
                let lowestIndex = 0;
                for (let i = 1; i < options.length; i++) {
                  if (options[i].price < options[lowestIndex].price) {
                    lowestIndex = i;
                  }
                }

                options = options.map((option: any, index: number) => ({
                  ...option,
                  isDefault: index === lowestIndex,
                }));
              } else {
                let foundDefault = false;
                options = options.map((option: any) => {
                  if (option.isDefault && !foundDefault) {
                    foundDefault = true;
                    return option;
                  }
                  return { ...option, isDefault: false };
                });
              }

              return {
                name: group.name.trim(),
                type: "single",
                description: group.description?.trim() || "",
                specLabels: {
                  label1: group.specLabels?.label1?.trim() || "Spec 1",
                  label2: group.specLabels?.label2?.trim() || "Spec 2",
                  label3: group.specLabels?.label3?.trim() || "Spec 3",
                },
                options,
              };
            })
            .filter(Boolean)
        : [];

    await connectDB();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        price: Number(price),
        image: image.trim(),
        category: category.trim(),
        description: description?.trim() || "",
        hasCustomization: !!hasCustomization,
        customizations: normalizedCustomizations,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // 4. Validate route parameter structure before executing deletions
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product identifier format configuration" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete product",
      },
      { status: 500 }
    );
  }
}