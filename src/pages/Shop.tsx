import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  short_description: string;
  is_featured: boolean;
  product_images: Array<{
    image_url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  categories?: {
    name: string;
    slug: string;
  };
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [sortBy, categoryFilter]);

  // Handle URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      // Find category by slug and set filter
      const category = categories.find(c => c.slug === categoryParam);
      if (category) {
        setCategoryFilter(category.id);
      }
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
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
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary),
          categories(name, slug)
        `)
        .eq('is_active', true);

      // Apply category filter
      if (categoryFilter !== "all") {
        query = query.eq('category_id', categoryFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order('price', { ascending: true });
          break;
        case "price-high":
          query = query.order('price', { ascending: false });
          break;
        case "name":
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        return;
      }

      console.log('Shop products fetched:', data?.length || 0, 'products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all" || sortBy !== "newest";

  const getSelectedCategoryName = () => {
    if (categoryFilter === "all") return null;
    const category = categories.find(c => c.id === categoryFilter);
    return category?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Shop All Products</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our complete collection of premium t-shirts designed for style and comfort
            </p>
          </div>
          
          {/* Loading Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-muted"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
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
            {getSelectedCategoryName() ? `${getSelectedCategoryName()} Collection` : 'Shop All Products'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our complete collection of premium t-shirts designed for style and comfort
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          {/* Mobile-first layout */}
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters - Horizontal scroll on mobile, flex on desktop */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible lg:flex-shrink-0">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] flex-shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] flex-shrink-0">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  className="flex-shrink-0 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {getSelectedCategoryName() && ` in ${getSelectedCategoryName()}`}
          </p>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms or filters" 
                  : "No products match your current filters"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;