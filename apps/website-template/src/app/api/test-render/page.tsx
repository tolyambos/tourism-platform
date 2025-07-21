import { getSiteConfig } from '@/lib/api/site';
import { SectionRenderer } from '@/components/section-renderer';

export default async function TestRenderPage() {
  const siteConfig = await getSiteConfig('rome');
  
  if (!siteConfig) {
    return <div>Site not found</div>;
  }
  
  const homePage = siteConfig.pages.find(p => p.type === 'HOME');
  
  if (!homePage) {
    return <div>Home page not found</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Render - Rome Site</h1>
      <pre className="bg-gray-100 p-4 mb-4 text-xs">
        {JSON.stringify({
          siteName: siteConfig.name,
          sectionsCount: homePage.sections.length,
          firstSectionTemplate: homePage.sections[0]?.template
        }, null, 2)}
      </pre>
      
      <div className="border-t pt-4">
        <h2 className="text-xl font-bold mb-4">Rendered Sections:</h2>
        <div className="flex flex-col">
          {homePage.sections.map((section: any) => (
            <SectionRenderer
              key={section.id}
              section={section}
              locale="en"
            />
          ))}
        </div>
      </div>
    </div>
  );
}