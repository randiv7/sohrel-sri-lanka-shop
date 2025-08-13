import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Product, Category } from "@/types/global";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState("relevance");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams, sortBy, categoryFilter]);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = searchParams.get('q') || '';
      
      let supabaseQuery = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary),
          categories(name, slug)
        `)
        .eq('is_active', true);

      // Apply search filter
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        supabaseQuery = supabaseQuery.eq('category_id', parseInt(categoryFilter));
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          supabaseQuery = supabaseQuery.order('price', { ascending: true });
          break;
        case "price-high":
          supabaseQuery = supabaseQuery.order('price', { ascending: false });
          break;
        case "name":
          supabaseQuery = supabaseQuery.order('name', { ascending: true });
          break;
        case "newest":
          supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
          break;
        default:
          // Relevance - put featured products first, then by creation date
          supabaseQuery = supabaseQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setCategoryFilter("all");
    setSortBy("relevance");
  };

  const currentQuery = searchParams.get('q') || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {currentQuery ? `Search Results for "${currentQuery}"` : "Search Products"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentQuery ? `Found ${products.length} products` : "Find what you're looking for"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
          
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {currentQuery ? "No products found matching your search." : "Enter a search term to find products."}
            </p>
            {currentQuery && (
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {products.length > 0 && (
          <div className="text-center mt-8 text-muted-foreground">
            Showing {products.length} result{products.length !== 1 ? 's' : ''} 
            {currentQuery && ` for "${currentQuery}"`}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;