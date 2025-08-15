// =============================
export default async function sitemap() {
  const base = "https://alexlorton.com";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/projects`, lastModified: new Date() },
    { url: `${base}/dashboard`, lastModified: new Date() },
    { url: `${base}/login`, lastModified: new Date() },
  ];
}