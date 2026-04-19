"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type CustomizationOption = {
  _id?: string;
  label: string;
  price: number;
  isDefault: boolean;
};

type CustomizationGroup = {
  _id?: string;
  name: string;
  type: "single";
  options: CustomizationOption[];
};

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  hasCustomization?: boolean;
  customizations?: CustomizationGroup[];
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success || !data.product) {
          router.push("/products");
          return;
        }

        const fetchedProduct = data.product as Product;
        setProduct(fetchedProduct);

        if (
          fetchedProduct.hasCustomization &&
          fetchedProduct.customizations &&
          fetchedProduct.customizations.length > 0
        ) {
          const defaults: Record<string, string> = {};

          fetchedProduct.customizations.forEach((group) => {
            const defaultOption =
              group.options.find((option) => option.isDefault) ||
              group.options[0];

            if (defaultOption) {
              defaults[group.name] = defaultOption.label;
            }
          });

          setSelectedOptions(defaults);
        }
      } catch (error) {
        console.error("PRODUCT DETAIL ERROR:", error);
        router.push("/products");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id, router]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;

    let total = Number(product.price) || 0;

    if (product.hasCustomization && product.customizations) {
      product.customizations.forEach((group) => {
        const selectedLabel = selectedOptions[group.name];

        const selectedOption = group.options.find(
          (option) => option.label === selectedLabel
        );

        if (selectedOption) {
          total += Number(selectedOption.price) || 0;
        }
      });
    }

    return total;
  }, [product, selectedOptions]);

  const liked = product ? isInWishlist(product._id) : false;

  const handleSelectOption = (groupName: string, optionLabel: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: optionLabel,
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product._id,
      title: product.title,
      price: finalPrice,
      image: product.image,
      selectedCustomizations: selectedOptions,
    });

    alert("Product added to cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (liked) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        id: product._id,
        title: product.title,
        price: finalPrice,
        image: product.image,
      });
    }
  };

  if (loading) {
    return <p className="empty-admin-records">Loading product...</p>;
  }

  if (!product) {
    return <p className="empty-admin-records">Product not found.</p>;
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail-layout">
        <div className="product-detail-image-box">
          <img
            src={product.image}
            alt={product.title}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-content">
          <p className="product-category">{product.category}</p>

          <h1>{product.title}</h1>

          <p className="product-detail-price">
            ₹{finalPrice.toLocaleString("en-IN")}
          </p>

          <p className="product-detail-description">
            {product.description || "No description available."}
          </p>

          {product.hasCustomization &&
            product.customizations &&
            product.customizations.length > 0 && (
              <div className="product-customization-box">
                <h2>Customize Your Product</h2>

                {product.customizations.map((group, groupIndex) => (
                  <div key={groupIndex} className="custom-group">
                    <h3>{group.name}</h3>

                    <div className="custom-options-list">
                      {group.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="custom-option">
                          <input
                            type="radio"
                            name={group.name}
                            value={option.label}
                            checked={
                              selectedOptions[group.name] === option.label
                            }
                            onChange={() =>
                              handleSelectOption(group.name, option.label)
                            }
                          />
                          <span>
                            {option.label} (+₹
                            {Number(option.price || 0).toLocaleString("en-IN")})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {product.hasCustomization && Object.keys(selectedOptions).length > 0 && (
            <div className="selected-config">
              <h3>Selected Configuration</h3>
              <ul>
                {Object.entries(selectedOptions).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="detail-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleWishlistToggle}
            >
              {liked ? "Remove Wishlist" : "Add Wishlist"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => router.push("/products")}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}