"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../components/AuthProvider';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';

interface ProductOwner {
  email: string;
  name: string;
  phone: string;
}

interface ProductMemory {
  thumbnail?: string;
  type?: string;
  url?: string;
}

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

type TimestampValue = string | FirestoreTimestamp;

interface Product {
  id: string;
  product_name: string;
  product_price: number;
  productCurrency: string;
  productCurrencySymbol: string;
  product_category: string;
  product_description: string;
  product_image: string;
  product_images?: string[];
  product_weight: string;
  product_rfid?: string[];
  eWillDocuments?: unknown[];
  insuranceDocuments?: unknown[];
  product_memories?: ProductMemory[];
  owner?: ProductOwner;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

function formatTimestamp(value: TimestampValue | undefined) {
  if (!value) return 'Unknown';
  if (typeof value === 'string') return value;
  if ('seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  return String(value);
}

const ITEMS_PER_PAGE = 9;

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-t-xl bg-slate-900">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-slate-800" />
      )}
      {error || !src ? (
        <div className="flex h-48 items-center justify-center text-slate-500">
          <ImageIcon className="h-10 w-10" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`h-48 w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Product details</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{product.product_name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <ProductImage src={product.product_image} alt={product.product_name} />
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Price</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {product.productCurrencySymbol}{product.product_price} {product.productCurrency}
              </p>
              <p className="mt-3 text-sm text-slate-400">Category: {product.product_category}</p>
              <p className="mt-1 text-sm text-slate-400">Weight: {product.product_weight}</p>
              <p className="mt-1 text-sm text-slate-400">Location: {product.location ?? 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Description</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{product.product_description}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Owner details</p>
                <p className="mt-3 font-medium text-white">{product.owner?.name ?? 'Unknown'}</p>
                <p className="text-sm text-slate-400">{product.owner?.email ?? 'No email'}</p>
                <p className="text-sm text-slate-400">{product.owner?.phone ?? 'No phone'}</p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Metadata</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="font-medium text-slate-200">Created:</span> {product.created_at ?? 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-200">Updated:</span> {product.updated_at ?? 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-200">RFID:</span> {product.product_rfid?.join(', ') ?? 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-200">eWill docs:</span> {product.eWillDocuments?.length ?? 0}
                  </div>
                  <div>
                    <span className="font-medium text-slate-200">Insurance docs:</span> {product.insuranceDocuments?.length ?? 0}
                  </div>
                  <div>
                    <span className="font-medium text-slate-200">Memory items:</span> {product.product_memories?.length ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {product.product_memories && product.product_memories.length > 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Memories</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {product.product_memories.map((memory, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                      <p className="font-medium text-white">{memory.type ?? 'Attachment'}</p>
                      <p className="text-slate-400">Thumbnail: {memory.thumbnail ? <a href={memory.thumbnail} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Open</a> : 'N/A'}</p>
                      <p className="text-slate-400">URL: {memory.url ? <a href={memory.url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Open</a> : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'digilusData');
        const snapshot = await getDocs(productsCollection);
        const items = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, unknown>;
          return {
            id: doc.id,
            ...data,
            created_at: formatTimestamp(data.created_at as TimestampValue | undefined),
            updated_at: formatTimestamp(data.updated_at as TimestampValue | undefined),
          } as Product;
        });
        setProducts(items);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Unable to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories for dropdown
  const uniqueCategories = Array.from(new Set(products.map(product => product.product_category))).sort();

  // Apply filters
  const filteredProducts = products.filter(product => {
    const searchMatch = !filters.search || 
      product.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (product.location?.toLowerCase() || '').includes(filters.search.toLowerCase());
    const categoryMatch = !filters.category || product.product_category === filters.category;
    const minPriceMatch = !filters.minPrice || product.product_price >= parseFloat(filters.minPrice);
    const maxPriceMatch = !filters.maxPrice || product.product_price <= parseFloat(filters.maxPrice);

    return searchMatch && categoryMatch && minPriceMatch && maxPriceMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const setPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#4c5683] px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Products</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Product catalog</h1>
                  {/* <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    Browse product data from the digilusData collection with image previews and metadata.
                  </p> */}
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* <button className="rounded-full bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800">
                    Sync products
                  </button>
                  <button className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
                    Add product
                  </button> */}
                  <button
                    onClick={() => void logout()}
                    className="rounded-full bg-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-600"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </section>

            {/* Filters Section */}
            <section className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Filters</p>
                  <p className="mt-1 text-sm text-slate-400">Filter products by various criteria</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Clear filters
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm text-slate-400">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Search by name or location..."
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="">All categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="0"
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="10000"
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </section>

            {error ? (
              <div className="rounded-3xl border border-red-800 bg-red-950/20 p-4 text-red-400">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-10 text-center text-slate-400 shadow-card">
                Loading products...
              </div>
            ) : (
              <section className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
                {currentProducts.map((product) => (
                  <article key={product.id} className="rounded-3xl border border-slate-800 bg-[#1f183ff2] shadow-card">
                    <ProductImage src={product.product_image} alt={product.product_name} />
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">{product.product_category}</p>
                          <h2 className="mt-2 text-2xl font-semibold text-white">{product.product_name}</h2>
                        </div>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">
                          {product.productCurrencySymbol}{product.product_price}
                        </span>
                      </div>
                      <p className="mb-4 text-sm leading-6 text-slate-400">{product.product_description}</p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Owner</p>
                          <p className="mt-2 font-medium text-white">{product.owner?.name ?? 'Unknown'}</p>
                          <p className="text-sm text-slate-400">{product.owner?.email ?? 'No email'}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Weight</p>
                          <p className="mt-2 font-medium text-white">{product.product_weight}</p>
                          <p className="text-sm text-slate-400">Location: {product.location ?? 'N/A'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="mt-6 w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                      >
                        View details
                      </button>
                    </div>
                  </article>
                ))}

                {totalPages > 1 && (
                  <div className="xl:col-span-3 lg:col-span-2">
                    <div className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-400">
                          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </button>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, index) => {
                              const page = index + 1;
                              return (
                                <button
                                  key={page}
                                  onClick={() => setPage(page)}
                                  className={`rounded-full px-4 py-2 text-sm transition ${
                                    currentPage === page
                                      ? 'bg-cyan-500 text-slate-950'
                                      : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>

        {selectedProduct ? (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        ) : null}
      </div>
    </AuthGuard>
  );
}
