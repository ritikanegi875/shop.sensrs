import Image from "next/image";
import Link from "next/link";

type Props = {
  _id?: string;
  id?: number;
  title: string;
  price: number;
  image: string;
  category?: string;
};

export default function ProductCard({
  _id,
  title,
  price,
  image,
  category,
}: Props) {
  return (
    <Link href={`/products/${_id}`}>
      <div className="product-card">
        <div className="product-image-box">
          <Image src={image} alt={title} width={220} height={220} />
        </div>

        {category && <span className="product-category">{category}</span>}

        <h3>{title}</h3>
        <p>₹{price.toLocaleString("en-IN")}</p>

        <button>Add to Cart</button>
      </div>
    </Link>
  );
}