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
      <section className="section-padding">
        <div className="container-sohrel">
          <h2 className="text-section-title text-center mb-12">SHOP BY STYLE</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-sohrel animate-pulse">
                <div className="aspect-square bg-muted mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-sohrel">
        <h2 className="text-section-title text-center mb-12">SHOP BY STYLE</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="card-sohrel group hover:bg-brand-grey-light transition-all duration-300"
            >
              <div className="aspect-square bg-brand-grey-light mb-4 overflow-hidden">
                <img
                  src={category.image_url || '/placeholder.svg'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-muted-foreground transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;