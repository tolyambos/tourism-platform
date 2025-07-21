interface QuickInfoBarProps {
  content: {
    duration: string;
    languages: string[];
    groupSize: string;
    features: string[];
  };
}

export default function QuickInfoBar({ content }: QuickInfoBarProps) {
  return (
    <section className="py-2 bg-white border-b border-gray-100 md:py-4">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center items-center text-xs md:gap-6 sm:text-sm">
          {/* Duration */}
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-medium text-gray-900">{content.duration}</span>
          </div>

          <span className="hidden text-gray-300 sm:inline">•</span>

          {/* Languages */}
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
            <span className="font-medium text-gray-900">{content.languages.length} Languages</span>
          </div>

          <span className="hidden text-gray-300 sm:inline">•</span>

          {/* Group Size */}
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span className="font-medium text-gray-900">{content.groupSize}</span>
          </div>

          {/* Additional Features */}
          {content.features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="hidden text-gray-300 sm:inline">•</span>
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-medium text-gray-900">{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}