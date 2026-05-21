// Quangle Tools - Main Application (099 Style Reference - Terminal/Digital Workbench)
// A collection of browser-based developer tools using Space Mono typography, dark mode, and 10px rounded corners.

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

// --- Tool Card Component (099 Elevated Card) ---
function ToolCard({ tool, index, onClick }) {
    const displayIndex = String(index + 1).padStart(2, '0');
    
    return (
        <button
            onClick={onClick}
            className="group cursor-pointer bg-steel hover:bg-muted/40 border border-muted hover:border-dim text-left w-full p-[26.5px] rounded-[10px] transition-all duration-200 flex flex-col justify-between gap-[16px] min-h-[180px] focus:outline-none focus:border-ghost"
        >
            <div className="flex items-center justify-between w-full">
                <span className="text-dim group-hover:text-ghost font-mono text-[14px]">
                    [{displayIndex}]
                </span>
                {/* Subtle Pill Tag */}
                <span className="bg-midnight text-ghost border border-muted group-hover:border-dim px-[12px] py-[6px] rounded-[10px] font-mono text-[12px] uppercase tracking-wider">
                    {tool.category}
                </span>
            </div>
            
            <div className="flex flex-col gap-2 flex-grow">
                <h3 className="font-mono text-[18px] text-ghost font-bold group-hover:text-ghost">
                    {tool.name}
                </h3>
                <p className="font-mono text-[14px] text-dim group-hover:text-ghost/85 leading-[1.4]">
                    {tool.description}
                </p>
            </div>
            
            <div className="flex justify-end items-center w-full mt-2 border-t border-muted/50 pt-3 group-hover:border-muted">
                <span className="font-mono text-[14px] text-ghost group-hover:translate-x-1 transition-transform flex items-center gap-2">
                    OPEN WORKBENCH <Icons.ArrowRight className="w-4 h-4 text-ghost" />
                </span>
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
        <div className="min-h-screen bg-midnight text-ghost px-4 md:px-8 py-[79px] font-mono antialiased text-[16px] leading-[1.2] tracking-[0.24px]">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-[48px]">
                
                {/* Hero Section */}
                <header className="flex flex-col gap-[16px] border-b border-muted pb-[26.5px]">
                    <div className="flex items-center justify-between">
                        <span className="text-dim font-mono text-[14px]">SYSTEM: LEQUANG1024 // ACTIVE</span>
                        <span className="text-dim font-mono text-[14px]">WORKBENCH V2.1 // 099 Theme</span>
                    </div>
                    
                    {/* Dark Terminal Frame line art header */}
                    <div className="bg-steel border border-muted p-[26.5px] rounded-[10px] flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-muted pb-3">
                            <span className="w-3 h-3 rounded-full bg-dim"></span>
                            <span className="w-3 h-3 rounded-full bg-dim/50"></span>
                            <span className="w-3 h-3 rounded-full bg-dim/20"></span>
                            <span className="text-dim font-mono text-[12px] ml-2">sandbox://terminal-hero</span>
                        </div>
                        <h1 className="text-[28px] font-bold text-ghost uppercase tracking-wider font-mono">
                            DIGITAL_ARCHIVE_
                        </h1>
                        <p className="text-dim text-[16px] max-w-3xl leading-[1.4] font-mono">
                            A command-line inspired interface containing specialized client-side developer utilities and interactive modules.
                        </p>
                    </div>
                </header>

                {/* Search & Category Filter Section */}
                <div className="flex flex-col gap-[16px] bg-steel p-[26.5px] rounded-[10px] border border-muted">
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] text-dim uppercase tracking-wider font-bold">Search Archive</label>
                        <div className="flex items-center gap-3 bg-midnight border border-muted focus-within:border-dim px-4 py-3 rounded-[10px] transition-colors">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ENTER KEYWORD TO FILTER WORKBENCH..."
                                className="bg-transparent text-ghost placeholder-dim outline-none w-full font-mono text-[16px] leading-[1.00] uppercase"
                            />
                            <Icons.Search className="w-5 h-5 text-dim" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center mt-2">
                        <span className="text-[14px] text-dim uppercase mr-2 font-bold">Filter //</span>
                        {categories.map(cat => {
                            const isSelected = cat === selectedCategory;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`font-mono text-[14px] leading-[1.00] px-[16px] py-[8px] rounded-[10px] transition-all duration-150 ${
                                        isSelected 
                                            ? 'bg-ghost text-midnight font-bold border border-ghost' 
                                            : 'bg-transparent text-ghost border border-muted hover:border-dim'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="flex flex-col gap-[16px]">
                    <div className="flex justify-between items-center text-dim font-bold text-[14px] px-2">
                        <span>[ SELECT COMPONENT ]</span>
                        <span>COUNT: {filteredTools.length}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                        {filteredTools.map((tool, idx) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                index={idx}
                                onClick={() => onSelectTool(tool)}
                            />
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="p-[48px] bg-steel rounded-[10px] border border-muted text-center text-dim font-mono text-[16px]">
                            SYSTEM ERROR: NO UTILITIES MATCHING REQUESTED PATTERN //
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-[48px] border-t border-muted pt-8 text-center text-dim font-mono text-[14px] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>© lequang1024 — all tools run client-side in sandbox</p>
                    <p>STATUS: OK // TERM_SEC_099</p>
                </footer>

            </div>
        </div>
    );
}

// --- Tool Page Wrapper ---
// Currently, standard tools that are React components load inside this layout.
// External pages like qr-deeplink-2.html are redirected to directly and have their own HTML structure.
function ToolPage({ tool, onBack }) {
    const ToolComponent = window[tool.component];
    const IconComponent = Icons[tool.icon] || Icons.Wrench;

    return (
        <div className="min-h-screen bg-midnight text-ghost px-4 md:px-8 py-[79px] font-mono antialiased text-[16px] leading-[1.2] tracking-[0.24px]">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                <header className="flex items-center justify-between border-b border-muted pb-6 mb-6">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 font-mono text-[14px] text-dim hover:text-ghost transition-colors rounded-[10px] bg-transparent border-none p-0 cursor-pointer"
                    >
                        <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        [ BACK TO ARCHIVE ]
                    </button>
                    <span className="font-mono text-[14px] uppercase tracking-wider text-dim">
                        {tool.category} // {tool.name}
                    </span>
                </header>

                <main className="bg-steel border border-muted p-[26.5px] rounded-[10px]">
                    {ToolComponent ? <ToolComponent /> : (
                        <div className="text-center font-mono py-12 text-dim">
                            SYSTEM EXCEPTION: COMPONENT NOT LOADED IN SCOPE //
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
            window.open(tool.url, '_self'); // Open in the same frame for a smoother experience
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
