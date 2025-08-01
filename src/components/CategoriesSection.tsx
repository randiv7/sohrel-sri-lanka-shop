import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('display_order')
        .limit(6);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder categories for demo
  const placeholderCategories = [
    {
      id: 'placeholder-1',
      name: 'Graphic Tees',
      slug: 'graphic-tees',
      description: 'Artistic designs and illustrations',
    },
    {
      id: 'placeholder-2',
      name: 'Minimalist',
      slug: 'minimalist',
      description: 'Clean and simple aesthetics',
    },
    {
      id: 'placeholder-3',
      name: 'Typography',
      slug: 'typography',
      description: 'Text-based artistic designs',
    },
    {
      id: 'placeholder-4',
      name: 'Oversized',
      slug: 'oversized',
      description: 'Comfortable loose-fit styles',
    },
    {
      id: 'placeholder-5',
      name: 'Plain Essentials',
      slug: 'plain-essentials',
      description: 'Classic solid color basics',
    },
    {
      id: 'placeholder-6',
      name: 'Vintage',
      slug: 'vintage',
      description: 'Retro-inspired designs',
    },
  ];

  const displayCategories = categories.length > 0 ? categories : placeholderCategories;

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-heading uppercase">
              Shop by Style
            </h2>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-heading uppercase">
            Shop by Style
          </h2>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed for every aesthetic
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative aspect-[4/3] md:aspect-[5/4] lg:aspect-square overflow-hidden bg-gray-100 transition-all duration-500 hover:shadow-xl"
            >
              {/* Full Image Background */}
              <img
                src={category.image_url || '/placeholder.svg'}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>
              
              {/* Centered Category Name */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-lg md:text-xl lg:text-2xl font-medium uppercase tracking-wide text-center px-4 transition-transform duration-500 group-hover:scale-105">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;