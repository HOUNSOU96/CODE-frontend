import React, { useEffect, useState, useRef } from "react";
import api from "@/utils/axios";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useLocation, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getImageUrl } from "@/utils/images";

type Product = {
  id: number;
  name: string;
  slug?: string;
  price: number;
  promoPrice?: number;
  image_url?: string;
  short_description?: string;
  category?: string;
};
type Promotion = { id: number; title: string; subtitle?: string; image_url?: string };

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("cat");

  useEffect(() => {
    let mounted = true;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pRes, promoRes] = await Promise.all([
          api.get(`/api/v1/products`, { params: { featured: true, limit: 8, category: category || undefined } }),
          api.get(`/api/v1/promotions`).catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setFeatured(pRes.data.products || []);
        setPromotions(promoRes.data || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Impossible de charger les produits. Vérifie l'API.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-white text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-500">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <HeroSection />
        <CategoriesSection />

        <div className="mt-12">
          <SectionTitle title="Produits en vedette" subtitle="Sélection exclusive Moravi" />
          {loading ? (
            <div className="py-12 text-center">Chargement des produits…</div>
          ) : error ? (
            <div className="py-12 text-center text-red-300">{error}</div>
          ) : (
            <FeaturedProducts products={featured} />
          )}
        </div>

        <div className="mt-12">
          <SectionTitle title="Promotions" subtitle="Nos offres du moment" />
          <PromotionsList promotions={promotions} />
        </div>

        <div className="mt-12">
          <AboutSection />
        </div>

        <div className="mt-12">
          <SectionTitle title="Témoignages" subtitle="Ce que nos clients disent" />
          <Testimonials />
        </div>

        <Footer />
      </main>
    </div>
  );
};

/* ---------- Header ---------- */
const Header: React.FC = () => (
  <header className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-r from-red-800 to-yellow-400 rounded-md p-2">
        <span className="font-serif text-2xl tracking-wider text-white">Ste MORAVI</span>
      </div>
      <nav className="hidden md:flex gap-6 ml-6">
        <Link to="/page1/boutique" className="hover:underline">Boutique</Link>
        <Link to="/page1/boutique?cat=vins" className="hover:underline">Vins</Link>
        <Link to="/page1/boutique?cat=alimentaire" className="hover:underline">Alimentaire</Link>
        <Link to="/page1/boutique?cat=entretien" className="hover:underline">Produits d'entretien</Link>
        <Link to="/page1/blog" className="hover:underline">Blog</Link>
      </nav>
    </div>

    <div className="flex items-center gap-4">
      <DarkModeToggle />
      <Link to="/page1/panier" className="px-3 py-2 bg-red-700 rounded-md text-white">Panier</Link>
      <Link to="/page1/login" className="px-3 py-2 border border-gray-700 rounded-md">Connexion</Link>
    </div>
  </header>
);

/* ---------- Hero ---------- */
const heroSlides = [
  { title: "MORAVI — L'élégance du goût", text: "Une sélection rigoureuse de vins pour sublimer votre quotidien.", image: "/images/hero1.jpg" },
  { title: "MORAVI — La qualité dans vos plats", text: "Des produits alimentaires soigneusement sélectionnés pour ravir votre cuisine.", image: "/images/hero2.jpg" },
  { title: "MORAVI — La propreté autour de vous", text: "Offrez-vous le meilleur soin avec nos produits d'exception.", image: "/images/hero3.jpg" },
];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const translateX = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
  const translateY = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[current];
  const handleMouseMove = (e: React.MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };

  return (
    <motion.section className="relative mt-6 rounded-2xl overflow-hidden shadow-2xl h-[500px] md:h-[600px]" onMouseMove={handleMouseMove}>
      <div className="absolute inset-0 bg-black/50 z-10" />
      <motion.div className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${slide.image})`, x: translateX, y: translateY }}
        initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div className="relative z-20 grid grid-cols-1 md:grid-cols-2 h-full p-8 md:p-16"
        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 1 }}
      >
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight text-white">{slide.title}</h1>
          <p className="mt-4 max-w-xl text-gray-200">{slide.text}</p>
          <div className="mt-6 flex gap-4">
            <Link to="/page1/boutique" className="inline-block px-6 py-3 rounded-md bg-red-700 text-white font-medium shadow">Découvrir la boutique</Link>
            <a href="#promotions" className="inline-block px-6 py-3 rounded-md bg-blue-700 text-white font-medium shadow">Offres du moment</a>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

/* ---------- Section Titles ---------- */
const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  </div>
);

/* ---------- Categories ---------- */
const CategoriesSection: React.FC = () => {
  const cats = [
    { key: "vins", title: "Vins", desc: "Rouges, blancs, rosés", icon: "🍷", gradient: ["#b91c1c", "#dc2626", "#facc15"] },
    { key: "alimentaire", title: "Alimentaire", desc: "Épicerie fine & saveurs", icon: "🍝", gradient: ["#ca8a04", "#fde68a", "#f97316"] },
    { key: "entretien", title: "Produits d'entretien", desc: "Produits écologiques", icon: "🧴", gradient: ["#15803d", "#22c55e", "#2dd4bf"] },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {cats.map(c => (
        <Link key={c.key} to={`/page1/boutique?cat=${c.key}`} className="relative rounded-lg overflow-hidden cursor-pointer perspective-1000">
          <div className="absolute inset-0 rounded-lg" style={{ backgroundImage: `linear-gradient(90deg, ${c.gradient.join(", ")})`, backgroundSize: "200% 100%" }} />
          <div className="relative z-10 flex items-center gap-4 p-6 border border-gray-700 text-white rounded-lg">
            <div className="text-4xl">{c.icon}</div>
            <div>
              <h3 className="text-lg font-medium">{c.title}</h3>
              <p className="text-gray-200 text-sm">{c.desc}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

/* ---------- Featured Products ---------- */
const FeaturedProducts: React.FC<{ products: Product[] }> = ({ products }) => {
  if (!products || products.length === 0) return <div className="py-8 text-center text-gray-400">Aucun produit vedette pour le moment.</div>;
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <motion.div whileHover={{ y: -6 }} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
    <Link to={`/produit/${product.slug || product.id}`}>
      <div className="h-44 w-full mb-3 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
        <img src={getImageUrl(product.image_url, product.slug)} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <h4 className="font-medium">{product.name}</h4>
      <p className="text-sm text-gray-400 mt-1">{product.short_description || ""}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        {product.promoPrice ? (
          <div className="flex flex-col">
            <span className="text-green-400 font-semibold">{formatPrice(product.promoPrice)}</span>
            <span className="line-through text-red-400 text-sm">{formatPrice(product.price)}</span>
          </div>
        ) : (
          <div className="text-lg font-semibold">{formatPrice(product.price)}</div>
        )}
        <div className="text-sm text-gray-300">Voir</div>
      </div>
    </Link>
  </motion.div>
);

/* ---------- Promotions ---------- */
const PromotionsList: React.FC<{ promotions: Promotion[] }> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) return <div id="promotions" className="py-8 text-center text-gray-400">Aucune promotion active pour le moment.</div>;
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map(promo => (
        <motion.div key={promo.id} whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-red-800/80 to-yellow-600/20 rounded-lg overflow-hidden p-4 border border-gray-700">
          <div className="h-40 w-full bg-center bg-cover rounded" style={{ backgroundImage: `url(${getImageUrl(promo.image_url, promo.title)})` }} />
          <div className="mt-3">
            <h4 className="text-lg font-semibold">{promo.title}</h4>
            {promo.subtitle && <p className="text-sm text-gray-200">{promo.subtitle}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ---------- About / Testimonials / Footer ---------- */
const AboutSection: React.FC = () => (
  <div className="bg-blue-800/60 rounded-lg p-6 border border-gray-700">
    <div className="md:flex md:items-center md:gap-8">
      <div className="flex-1">
        <h3 className="text-2xl font-semibold">À propos de Moravi</h3>
        <p className="text-gray-300 mt-3">Moravi sélectionne pour vous des vins d'exception et des produits de qualité...</p>
        <div className="mt-4"><Link to="/page1/a-propos" className="underline">En savoir plus</Link></div>
      </div>
      <div className="mt-6 md:mt-0 md:w-64">
        <img src={getImageUrl(undefined, "cave", 800, 600)} alt="cave" className="rounded-lg shadow" loading="lazy" />
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const items = [
    { name: "Claire R.", text: "Sélection incroyable — livraison rapide et service impeccable.", stars: 5 },
    { name: "Jean M.", text: "Des vins bien choisis et des conseils utiles. Je recommande.", stars: 5 },
    { name: "Sophie L.", text: "Très satisfaite des produits d'entretien écologiques.", stars: 4 },
  ];
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((t, i) => (
        <motion.div key={i} whileHover={{ y: -4 }} className="bg-blue-800/60 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center">{t.name[0]}</div>
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-yellow-400">{Array.from({ length: t.stars }).map(() => "★").join("")}</div>
            </div>
          </div>
          <p className="mt-3 text-gray-300">"{t.text}"</p>
        </motion.div>
      ))}
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="mt-12 border-t border-gray-800/60 pt-6">
    <div className="md:flex md:items-start md:justify-between">
      <div>
        <div className="font-serif text-xl">Moravi</div>
        <p className="text-gray-400 text-sm mt-2">© {new Date().getFullYear()} Moravi — Tous droits réservés</p>
      </div>
      <div className="mt-6 md:mt-0 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="font-semibold">Company</div>
          <ul className="mt-2 space-y-2 text-gray-400">
            <li><Link to="/page1/a-propos">À propos</Link></li>
            <li><Link to="/page1/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Aide</div>
          <ul className="mt-2 space-y-2 text-gray-400">
            <li><Link to="/page1/faq">FAQ</Link></li>
            <li><Link to="/page1/livraison">Livraison</Link></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

/* ---------- Helpers ---------- */
function formatPrice(p?: number) { return p == null ? "—" : Number(p).toFixed(2) + " €"; }

export default Home;
