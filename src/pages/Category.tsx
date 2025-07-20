import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to shop page with category filter
    if (slug) {
      navigate(`/shop?category=${slug}`, { replace: true });
    } else {
      navigate("/shop", { replace: true });
    }
  }, [slug, navigate]);

  return null; // This component just redirects
};

export default Category;