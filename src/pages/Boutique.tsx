import React, { useEffect, useState } from "react";
import axios from "axios";
import { getImageUrl } from "@/utils/images";
import { Link, useSearchParams, useLocation } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  image_url?: string;
  short_description?: string;
  category?: string;
};

const Boutique: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("cat");

  const location = useLocation();
  const state = location.state as { from?: string };
  const from = state?.from || "/";

  useEffect(() => {
    let mounted = true;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/api/v1/products`, {
          params: { category: category || undefined },
        });
        if (!mounted) return;
        // Compatibilité : l'API peut retourner "products" ou tableau direct
        const data = res.data.products || res.data;
        setProducts(data);
        console.log("🧠 Produits reçus :", data);
      } catch (err) {
        if (!mounted) return;
        setError("Impossible de charger les produits.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [category]);

  if (loading) return <div className="text-center py-12 text-gray-400">Chargement…</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-semibold mb-6">
        Boutique {category ? `- ${category}` : ""}
      </h1>

      {products.length === 0 ? (
        <div className="text-gray-400 text-center py-12">Aucun produit disponible.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/produit/${p.slug}`}
              state={{ from: location.pathname + location.search }}
              className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 hover:shadow-md transition text-white"
            >
              <div className="h-44 w-full mb-3 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={getImageUrl(p.image_url)}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <h4 className="font-medium">{p.name}</h4>
              {p.short_description && (
                <p className="text-gray-400 text-sm mt-1">{p.short_description}</p>
              )}
              <div className="mt-2 text-lg font-semibold flex gap-2 items-center">
                {p.promoPrice ? (
                  <>
                    <span className="line-through text-red-400">{formatPrice(p.price)}</span>
                    <span className="text-green-500">{formatPrice(p.promoPrice)}</span>
                  </>
                ) : (
                  <span>{formatPrice(p.price)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

function formatPrice(p?: number) {
  return p == null ? "—" : Number(p).toFixed(2) + " €";
}

export default Boutique;
