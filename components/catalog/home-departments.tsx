import { getCategories, getProducts } from "@/lib/commerce/catalog";
import { ProductGrid } from "./product-grid";
import { ProductRail } from "./product-rail";

export async function HomeDepartments() {
  const categories = await getCategories().catch(() => []);
  const departments = await Promise.all([
    {slug:"sacred-incense",title:"Discover Sacred Incense",description:"Explore scents, materials and sizes."},
    {slug:"shamanic-tools",title:"Explore Shamanic Tools",description:"Find the details that make each object different."},
  ].map(async item => {
    const category = categories.find(category => category.slug === item.slug);
    const products = category ? await getProducts({category:category.id,per_page:8}).then(result => result.data).catch(() => []) : [];
    return {...item,products};
  }));
  return <div className="shell department-shelves">{departments.filter(item => item.products.length).map(item => <ProductRail key={item.slug} title={item.title} description={item.description} href={`/collections/${item.slug}`}><ProductGrid products={item.products} /></ProductRail>)}</div>;
}
