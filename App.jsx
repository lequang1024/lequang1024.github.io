// Quangle Tools - Main Application
// A collection of browser-based developer tools

const { useState, useEffect } = React;

// --- Shared Icons Component ---
const Icon = ({ children, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);

// Icon library - shared across all tools
window.Icons = {
    Scissors: ({ className }) => (
        <Icon className={className}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" x2="8.12" y1="4" y2="15.88" /><line x1="14.47" x2="20" y1="14.48" y2="20" /><line x1="8.12" x2="12" y1="8.12" y2="12" /></Icon>
    ),
    FileJson: ({ className }) => (
        <Icon className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" /></Icon>
    ),
    Upload: ({ className }) => (
        <Icon className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></Icon>
    ),
    Copy: ({ className }) => (
        <Icon className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></Icon>
    ),
    Download: ({ className }) => (
        <Icon className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></Icon>
    ),
    RefreshCw: ({ className }) => (
        <Icon className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></Icon>
    ),
    AlertCircle: ({ className }) => (
        <Icon className={className}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></Icon>
    ),
    Check: ({ className }) => (
        <Icon className={className}><polyline points="20 6 9 17 4 12" /></Icon>
    ),
    Settings: ({ className }) => (
        <Icon className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></Icon>
    ),
    ArrowRight: ({ className }) => (
        <Icon className={className}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
    ),
    ArrowLeft: ({ className }) => (
        <Icon className={className}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
    ),
    Home: ({ className }) => (
        <Icon className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>
    ),
    Wrench: ({ className }) => (
        <Icon className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Icon>
    ),
    Plus: ({ className }) => (
        <Icon className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
    ),
    Code: ({ className }) => (
        <Icon className={className}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></Icon>
    ),
    Database: ({ className }) => (
        <Icon className={className}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></Icon>
    ),
    FileText: ({ className }) => (
        <Icon className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></Icon>
    ),
    Image: ({ className }) => (
        <Icon className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></Icon>
    ),
    Palette: ({ className }) => (
        <Icon className={className}><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" /></Icon>
    )
};

// --- Tool Registry ---
// Tools are auto-generated from JSX files in tools/ directory
const STATIC_TOOLS = window.JsxTools || [];

// Merge with generated tools if available
const TOOLS = [...STATIC_TOOLS, ...(window.RepoTools || [])];

// Category icons mapping
const CATEGORY_ICONS = {
    'Data': 'Database',
    'Text': 'FileText',
    'Code': 'Code',
    'Image': 'Image',
    'Design': 'Palette',
    'Utility': 'Wrench'
};

// --- Tool Card Component ---
function ToolCard({ tool, onClick }) {
    const IconComponent = Icons[tool.icon] || Icons.Wrench;

    return (
        <button
            onClick={onClick}
            className="group bg-vscode-sidebar hover:bg-vscode-hover border border-vscode-border hover:border-vscode-accent rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-vscode-accent/10"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-vscode-button/30 group-hover:bg-vscode-button rounded-lg transition-colors">
                    <IconComponent className="w-6 h-6 text-vscode-accent group-hover:text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-vscode-text group-hover:text-white mb-1">
                        {tool.name}
                    </h3>
                    <p className="text-sm text-vscode-text-muted group-hover:text-vscode-text">
                        {tool.description}
                    </p>
                    <span className="inline-block mt-3 text-xs px-2 py-1 bg-vscode-active rounded text-vscode-text-muted">
                        {tool.category}
                    </span>
                </div>
                <Icons.ArrowRight className="w-5 h-5 text-vscode-text-dim group-hover:text-vscode-accent transition-colors" />
            </div>
        </button>
    );
}

// --- Home Page Component ---
function HomePage({ tools, onSelectTool }) {
    const categories = [...new Set(tools.map(t => t.category))];

    return (
        <div className="min-h-screen bg-vscode-bg text-vscode-text p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-4 bg-vscode-button rounded-lg shadow-lg shadow-vscode-accent/20">
                            <Icons.Wrench className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-vscode-text mb-3">
                        Quangle Tools
                    </h1>
                    <p className="text-vscode-text-muted text-lg max-w-md mx-auto">
                        A collection of browser-based developer tools. No installation required.
                    </p>
                </header>

                {/* Tools Grid */}
                <div className="space-y-8">
                    {categories.map(category => (
                        <div key={category}>
                            <div className="flex items-center gap-2 mb-4">
                                {Icons[CATEGORY_ICONS[category]] && React.createElement(Icons[CATEGORY_ICONS[category]], { className: "w-4 h-4 text-vscode-text-muted" })}
                                <h2 className="text-sm font-semibold text-vscode-text-muted uppercase tracking-wider">
                                    {category}
                                </h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {tools
                                    .filter(t => t.category === category)
                                    .map(tool => (
                                        <ToolCard
                                            key={tool.id}
                                            tool={tool}
                                            onClick={() => onSelectTool(tool)}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {tools.length === 0 && (
                    <div className="text-center py-16">
                        <Icons.Plus className="w-12 h-12 text-vscode-text-dim mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-vscode-text-muted mb-2">No tools yet</h3>
                        <p className="text-vscode-text-dim">Tools will appear here once added.</p>
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-vscode-border text-center text-sm text-vscode-text-muted">
                    <p>All tools run entirely in your browser. No data is sent to any server.</p>
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
        <div className="min-h-screen bg-vscode-bg text-vscode-text p-4 md:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
                {/* Header */}
                <header className="mb-6 flex items-center gap-4 border-b border-vscode-border pb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-vscode-hover rounded-lg transition-colors"
                        title="Back to tools"
                    >
                        <Icons.ArrowLeft className="w-5 h-5 text-vscode-text-muted" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-vscode-button rounded-lg shadow-lg shadow-vscode-accent/10">
                            <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-vscode-text">
                                {tool.name}
                            </h1>
                            <p className="text-vscode-text-muted text-sm mt-1">{tool.description}</p>
                        </div>
                    </div>
                </header>

                {/* Tool Content */}
                <main className="flex-1 min-h-0">
                    <ToolComponent />
                </main>
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [currentTool, setCurrentTool] = useState(null);

    // Handle browser back button
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

        // Set initial state from URL
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
