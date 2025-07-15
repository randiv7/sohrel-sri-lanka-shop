import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

interface ProductImage {
  file: File;
  preview: string;
  is_primary: boolean;
}

const AdminProductNew = () => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Product form data
  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    sale_price: "",
    sku: "",
    category_id: "",
    is_active: true,
    is_featured: false,
    weight: "",
    dimensions: "",
    meta_title: "",
    meta_description: "",
    tags: ""
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (productData.name && !productData.slug) {
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setProductData(prev => ({ ...prev, slug }));
    }
  }, [productData.name]);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (error || !adminData) {
        navigate('/admin/login');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      size: "",
      color: "",
      price: parseFloat(productData.price) || 0,
      stock_quantity: 0,
      sku: ""
    }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setImages(prev => [...prev, {
          file,
          preview,
          is_primary: prev.length === 0 // First image is primary by default
        }]);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first one primary
      if (prev[index].is_primary && newImages.length > 0) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })));
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!productData.price || parseFloat(productData.price) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Valid price is required",
        variant: "destructive",
      });
      return false;
    }

    if (variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one product variant is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create product
      const productInsertData = {
        name: productData.name,
        slug: productData.slug,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: parseFloat(productData.price),
        sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
        sku: productData.sku || null,
        category_id: productData.category_id || null,
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        dimensions: productData.dimensions || null,
        meta_title: productData.meta_title || null,
        meta_description: productData.meta_description || null,
        tags: productData.tags ? productData.tags.split(',').map(tag => tag.trim()) : null
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productInsertData])
        .select()
        .single();

      if (productError) {
        console.error('Error creating product:', productError);
        toast({
          title: "Error",
          description: "Failed to create product",
          variant: "destructive",
        });
        return;
      }

      // Create variants
      const variantInsertData = variants.map(variant => ({
        product_id: product.id,
        size: variant.size,
        color: variant.color || null,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        sku: variant.sku || null
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantInsertData);

      if (variantError) {
        console.error('Error creating variants:', variantError);
        toast({
          title: "Error",
          description: "Failed to create product variants",
          variant: "destructive",
        });
        return;
      }

      // Upload images (for now we'll use placeholder URLs since we don't have storage set up)
      if (images.length > 0) {
        const imageInsertData = images.map((image, index) => ({
          product_id: product.id,
          image_url: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&${index}`, // Placeholder
          alt_text: `${product.name} - Image ${index + 1}`,
          is_primary: image.is_primary,
          display_order: index
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageInsertData);

        if (imageError) {
          console.error('Error creating images:', imageError);
          // Don't fail the whole operation for images
        }
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
            <p className="text-muted-foreground">
              Create a new product for your store
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={productData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="product-url-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={productData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Regular Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={productData.sale_price}
                    onChange={(e) => handleInputChange('sale_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="PRODUCT-SKU"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={productData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Product Variants</CardTitle>
                <Button type="button" onClick={addVariant} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No variants added yet. Click "Add Variant" to create size/color options.
                </p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label>Size *</Label>
                          <Input
                            value={variant.size}
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            placeholder="S, M, L, XL"
                            required
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Input
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            placeholder="Red, Blue, etc."
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variant.stock_quantity}
                            onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="VARIANT-SKU"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Upload Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload product images. The first image will be set as primary.
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {image.is_primary && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {!image.is_primary && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute bottom-2 left-2 text-xs"
                            onClick={() => setPrimaryImage(index)}
                          >
                            Set Primary
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this product visible to customers
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={productData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_featured">Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this product in featured sections
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={productData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductNew;