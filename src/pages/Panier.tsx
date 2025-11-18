import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/images";

type CheckoutForm = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  payment: string;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  image_url?: string;
  short_description?: string;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    payment: "card",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("moravi_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemove = (id: number) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem("moravi_cart", JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Commande :", { form, cart });
    localStorage.removeItem("moravi_cart");
    setSuccess(true);
  };

  if (success)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-100 bg-gray-900">
        <h2 className="text-3xl mb-4">Merci pour votre commande !</h2>
        <button
          className="px-6 py-3 bg-red-700 rounded-md text-white font-medium shadow hover:bg-red-800"
          onClick={() => navigate("/boutique")}
        >
          Retour à la boutique
        </button>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-300 bg-gray-900">
        <h2 className="text-2xl mb-4">Votre panier est vide</h2>
        <button
          className="text-red-500 underline"
          onClick={() => navigate("/boutique")}
        >
          Retour à la boutique
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl font-serif mb-6">Passer la commande</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={form.name}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Adresse"
              value={form.address}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="Ville"
              value={form.city}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
              required
            />
            <input
              type="text"
              name="zip"
              placeholder="Code postal"
              value={form.zip}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
              required
            />
            <select
              name="payment"
              value={form.payment}
              onChange={handleChange}
              className="p-3 rounded bg-gray-800 border border-gray-700"
            >
              <option value="card">Carte bancaire</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Paiement à la livraison</option>
            </select>

            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-red-700 rounded-md text-white font-medium shadow hover:bg-red-800"
            >
              Valider la commande
            </button>
          </div>

          {/* Récapitulatif du panier */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.short_description && (
                      <p className="text-gray-400 text-sm">{item.short_description}</p>
                    )}
                    <p className="text-gray-300 mt-1">
                      {item.promoPrice
                        ? <>
                            <span className="line-through text-red-400">{formatPrice(item.price)}</span>{" "}
                            <span className="text-green-500">{formatPrice(item.promoPrice)}</span>
                          </>
                        : formatPrice(item.price)
                      } x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-3 py-1 bg-red-600 rounded-md text-white hover:bg-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}

              <div className="mt-2 border-t border-gray-700 pt-2 flex justify-between font-semibold">
                <span>Total :</span>
                <span>
                  {formatPrice(
                    cart.reduce(
                      (sum, i) => sum + (i.promoPrice || i.price) * i.quantity,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ---------- Helpers ---------- */
function formatPrice(p?: number) {
  if (!p) return "—";
  return Number(p).toFixed(2) + " €";
}
