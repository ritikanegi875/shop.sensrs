import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ProductProvider } from "@/context/ProductContext";
import { BannerProvider } from "@/context/BannerContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BannerProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </BannerProvider>
      </body>
    </html>
  );
}