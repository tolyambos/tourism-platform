import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@tourism/database";
import { TemplateEditor } from "./template-editor";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateEditorPage({ params }: PageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { templateId } = await params;

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    notFound();
  }

  // Get the prompt data from our section-prompts file
  const promptData = await getPromptDataForTemplate(template.name);

  return <TemplateEditor template={template} promptData={promptData} />;
}

async function getPromptDataForTemplate(templateName: string) {
  try {
    // Import the prompts file
    const prompts = await import('@tourism/ai-engine/src/gemini/section-prompts');
    
    // Map template names to prompt exports
    const promptMap: Record<string, { systemInstruction: string; userPrompt?: (attraction: string, location: string) => string; responseSchema: unknown }> = {
      'attraction-hero': prompts.attractionHeroPrompt,
      'quick-info-bar': prompts.quickInfoBarPrompt,
      'product-cards': prompts.productCardsPrompt,
      'tabbed-info': prompts.tabbedInfoPrompt,
      'reviews-carousel': prompts.reviewsCarouselPrompt,
      'faq-accordion': prompts.faqAccordionPrompt,
      'final-cta': prompts.finalCTAPrompt,
    };
    
    const promptData = promptMap[templateName];
    
    if (!promptData) return null;
    
    // Convert function to string for client component
    return {
      systemInstruction: promptData.systemInstruction,
      userPromptExample: promptData.userPrompt ? 
        promptData.userPrompt('${attraction}', '${location}') : undefined,
      responseSchema: promptData.responseSchema
    };
  } catch (error) {
    console.error('Error loading prompt data:', error);
    return null;
  }
}