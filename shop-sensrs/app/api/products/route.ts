import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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

              // Process options mapping containing flexible custom specifications per tab setup
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
                // Safely maps the independent labels per tab group down into your database document collection
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

    const product = await Product.create({
      title: title.trim(),
      price: Number(price),
      image: image.trim(),
      category: category.trim(),
      description: description?.trim() || "",
      hasCustomization: !!hasCustomization,
      customizations: normalizedCustomizations,
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}