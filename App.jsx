// Quangle Tools - Main Application (Dries Bos - Wireframe on Parchment Style)
// A collection of browser-based developer tools

const { useState, useEffect } = React;

// --- Shared Icons Component ---
const Icons = {
    Search: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
    ),
    ArrowRight: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    ArrowLeft: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="19" x2="5" y1="12" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    Wrench: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    )
};

// --- Tool Registry ---
const STATIC_TOOLS = window.JsxTools || [];
const TOOLS = [...STATIC_TOOLS, ...(window.RepoTools || [])];

// --- Tool Row Component (Naked Table Row Button) ---
function ToolRow({ tool, index, onClick }) {
    const displayIndex = String(index + 1).padStart(2, '0');
    
    return (
        <button
            onClick={onClick}
            className="group flex flex-col md:flex-row md:items-center justify-between text-left w-full gap-4 p-[25px] border-t border-ink hover:border-ash bg-transparent rounded-none transition-colors duration-200"
        >
            <div className="flex items-baseline gap-4 md:w-1/3">
                <span className="font-mono text-[20px] leading-[1.00] text-ash group-hover:text-ink">
                    [{displayIndex}]
                </span>
                <span className="font-sans text-[20px] leading-[1.45] text-ink font-medium">
                    {tool.name}
                </span>
            </div>
            
            <div className="flex-1 font-sans text-[20px] leading-[1.45] text-ash group-hover:text-ink md:mx-4">
                {tool.description}
            </div>
            
            <div className="flex items-center gap-6 justify-between md:justify-end md:w-1/4">
                {/* Subtle Pill Tag */}
                <span className="bg-parchment text-ink border border-ink/20 px-[15px] pt-[10px] pb-[9px] rounded-[1000px] font-mono text-[14px] leading-[1.00] uppercase tracking-wider">
                    {tool.category}
                </span>
                <Icons.ArrowRight className="w-5 h-5 text-ash group-hover:text-ink group-hover:translate-x-1 transition-all" />
            </div>
        </button>
    );
}

// --- Home Page Component ---
function HomePage({ tools, onSelectTool }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const categories = ['ALL', ...new Set(tools.map(t => t.category.toUpperCase()))];

    const filteredTools = tools.filter(tool => {
        const matchesSearch = 
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = 
            selectedCategory === 'ALL' || 
            tool.category.toUpperCase() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-parchment text-ink px-4 md:px-8 py-[79px] font-sans antialiased text-[20px] leading-[1.45]">
            <div className="max-w-[1150px] mx-auto flex flex-col gap-[79px]">
                
                {/* Hero Section */}
                <header className="text-center flex flex-col gap-6">
                    {/* Wireframe window-frame graphic in Ink Jot line art */}
                    <svg viewBox="0 0 800 240" className="w-full max-w-2xl mx-auto text-ink stroke-current fill-none stroke-[1] mb-2" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer frame */}
                        <rect x="5" y="5" width="790" height="230" />
                        {/* Title bar */}
                        <line x1="5" y1="45" x2="795" y2="45" />
                        {/* Window controls */}
                        <rect x="20" y="18" width="10" height="10" />
                        <rect x="38" y="18" width="10" height="10" />
                        <rect x="56" y="18" width="10" height="10" />
                        <text x="400" y="27" className="font-mono text-[13px] fill-current text-center" textAnchor="middle" stroke="none">lequang1024.github.io // DIGITAL ARCHIVE</text>
                        
                        {/* Architect grid lines */}
                        <line x1="160" y1="45" x2="160" y2="235" strokeDasharray="3 3" className="text-ash" />
                        <line x1="320" y1="45" x2="320" y2="235" strokeDasharray="3 3" className="text-ash" />
                        <line x1="480" y1="45" x2="480" y2="235" strokeDasharray="3 3" className="text-ash" />
                        <line x1="640" y1="45" x2="640" y2="235" strokeDasharray="3 3" className="text-ash" />
                        
                        <line x1="5" y1="100" x2="795" y2="100" strokeDasharray="3 3" className="text-ash" />
                        <line x1="5" y1="160" x2="795" y2="160" strokeDasharray="3 3" className="text-ash" />
                        
                        {/* Geometric layout details */}
                        <circle cx="400" cy="140" r="45" strokeDasharray="4 4" className="text-ash" />
                        <polygon points="400,85 445,140 400,195 355,140" />
                        <line x1="340" y1="140" x2="460" y2="140" />
                        <line x1="400" y1="80" x2="400" y2="200" />
                        
                        <text x="400" y="145" className="font-mono text-[14px] fill-current" textAnchor="middle" stroke="none">Q_T_L</text>
                    </svg>

                    <div className="max-w-md mx-auto">
                        <h1 className="font-mono text-[24px] uppercase tracking-wider mb-2 font-normal">
                            Quangle Tools
                        </h1>
                        <p className="text-ash text-[20px] leading-[1.45]">
                            A collection of browser-based utilities built with strict structure and minimalist aesthetics.
                        </p>
                    </div>
                </header>

                {/* Search & Category Filter Section */}
                <div className="flex flex-col gap-8">
                    {/* Underlined Input Field */}
                    <div className="flex flex-col gap-2">
                        <span className="font-mono text-[16px] text-ash uppercase tracking-wider">Search Archive</span>
                        <div className="flex items-center gap-3 border-b-2 border-ink py-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="TYPE KEYWORD TO FILTER..."
                                className="bg-transparent text-ink placeholder-ash outline-none w-full font-mono text-[20px] leading-[1.00] uppercase rounded-none"
                            />
                            <Icons.Search className="w-6 h-6 text-ink" />
                        </div>
                    </div>

                    {/* Filter categories as Subtle Pill Tags */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-mono text-[16px] text-ash uppercase mr-2">Filter //</span>
                        {categories.map(cat => {
                            const isSelected = cat === selectedCategory;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`font-mono text-[14px] leading-[1.00] px-[15px] pt-[10px] pb-[9px] rounded-[1000px] border transition-colors duration-150 ${
                                        isSelected 
                                            ? 'bg-ink text-parchment border-ink' 
                                            : 'bg-transparent text-ash border-ash hover:text-ink hover:border-ink'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tools Table / List */}
                <div className="flex flex-col">
                    {/* Outlined Category Tags as Headers */}
                    <div className="hidden md:flex justify-between items-center mb-6 font-mono text-[18px]">
                        <div className="border border-ink px-[15px] py-[10px] w-1/3 rounded-none">
                            [ 01. NAME ]
                        </div>
                        <div className="border border-ink px-[15px] py-[10px] flex-1 mx-4 rounded-none">
                            [ 02. FUNCTION / DESCRIPTION ]
                        </div>
                        <div className="border border-ink px-[15px] py-[10px] text-right rounded-none">
                            [ 03. CATEGORY ]
                        </div>
                    </div>

                    {/* Naked Table Rows list */}
                    <div className="flex flex-col">
                        {filteredTools.map((tool, idx) => (
                            <ToolRow
                                key={tool.id}
                                tool={tool}
                                index={idx}
                                onClick={() => onSelectTool(tool)}
                            />
                        ))}

                        {filteredTools.length === 0 && (
                            <div className="p-[25px] border-t border-ink text-center text-ash font-mono text-[20px]">
                                NO UTILITIES FOUND IN ARCHIVE //
                            </div>
                        )}

                        {/* Table bottom line closure */}
                        <div className="border-t border-ink w-full"></div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-[79px] border-t border-ink/20 pt-8 text-center font-mono text-[16px] text-ash">
                    <p>© lequang1024 — all tools run client-side. v2.0</p>
                </footer>

            </div>
        </div>
    );
}

// --- Tool Page Wrapper ---
function ToolPage({ tool, onBack }) {
    const ToolComponent = window[tool.component];
    const IconComponent = Icons[tool.icon] || Icons.Wrench;

    return (
        <div className="min-h-screen bg-parchment text-ink px-4 md:px-8 py-[79px] font-sans antialiased text-[20px] leading-[1.45]">
            <div className="max-w-[1150px] mx-auto flex flex-col gap-6">
                <header className="flex items-center justify-between border-b border-ink pb-6 mb-6">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 font-mono text-[18px] text-ash hover:text-ink transition-colors rounded-none bg-transparent border-none"
                    >
                        <Icons.ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        [ BACK TO ARCHIVE ]
                    </button>
                    <span className="font-mono text-[18px] uppercase tracking-wider text-ash">
                        {tool.category} // {tool.name}
                    </span>
                </header>

                <main className="bg-transparent border border-ink p-[25px] rounded-none">
                    {ToolComponent ? <ToolComponent /> : (
                        <div className="text-center font-mono py-12 text-ash">
                            UTILITY COMPONENT NOT LOADED IN SCOPE //
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [currentTool, setCurrentTool] = useState(null);

    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                const tool = TOOLS.find(t => t.id === hash);
                setCurrentTool(tool || null);
            } else {
                setCurrentTool(null);
            }
        };

        handlePopState();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const selectTool = (tool) => {
        if (tool.url) {
            window.open(tool.url, '_blank');
            return;
        }
        setCurrentTool(tool);
        window.location.hash = tool.id;
    };

    const goHome = () => {
        setCurrentTool(null);
        window.location.hash = '';
    };

    if (currentTool) {
        return <ToolPage tool={currentTool} onBack={goHome} />;
    }

    return <HomePage tools={TOOLS} onSelectTool={selectTool} />;
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
