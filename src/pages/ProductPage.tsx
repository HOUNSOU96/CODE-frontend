// 📁 src/pages/ProductPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "@/utils/axios";
import { getImageUrl } from "@/utils/images";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  image_url?: string;
  short_description?: string;
  category?: string;
  description?: string;
};

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string };
  const from = state?.from || "/";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/products/${slug}`);
        const data = res.data.product || res.data;
        console.log("🧠 Produit reçu :", data); // debug console
        setProduct(data);
      } catch (err) {
        console.error("Erreur de chargement produit :", err);
        setError("Produit introuvable");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) return <div className="py-12 text-center text-white">Chargement…</div>;
  if (error) return <div className="py-12 text-center text-red-400">{error}</div>;
  if (!product) return <div className="text-center text-gray-400 py-12">Aucun produit trouvé.</div>;

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* 🔙 Bouton retour */}
      <button
        onClick={() => navigate(from)}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        ← Retour
      </button>

      <div className="md:flex gap-8">
        {/* 🖼️ Image du produit */}
        <div className="md:w-1/2">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>

        {/* 📄 Détails du produit */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-400 mt-2">{product.short_description}</p>

          {/* 💰 Prix et promotion */}
          <div className="mt-4 text-2xl font-bold">
            {product.promoPrice ? (
              <>
                <span className="line-through text-gray-400 mr-2">
                  {formatPrice(product.price)}
                </span>
                <span className="text-red-500">{formatPrice(product.promoPrice)}</span>
              </>
            ) : (
              <span className="text-green-400">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* 📂 Catégorie */}
          {product.category && (
            <p className="mt-4 text-gray-300">
              <strong>Catégorie :</strong> {product.category}
            </p>
          )}

          {/* 📜 Description complète */}
          {product.description && (
            <p className="mt-4 text-gray-200 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* 🧾 JSON brut pour debug (à masquer plus tard) */}
          <pre className="mt-6 bg-gray-900/50 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(product, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

function formatPrice(p?: number) {
  if (!p) return "—";
  return Number(p).toFixed(2) + " €";
}

export default ProductPage;
