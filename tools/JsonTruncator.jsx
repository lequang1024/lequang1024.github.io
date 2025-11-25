// tools/JsonTruncator.jsx

// @tool name: JSON Truncator
// @tool description: Truncate large JSON files for AI context windows
// @tool icon: Scissors
// @tool category: Data

(function() {
    const { useState, useEffect, useRef } = React;
    
    function JsonTruncator() {
        // Access shared icons (lazily to ensure window.Icons is defined)
        const { Scissors, FileJson, Upload, Copy, Download, RefreshCw, AlertCircle, Check, Settings, ArrowRight } = window.Icons;

        const [inputJson, setInputJson] = useState('');
        const [outputJson, setOutputJson] = useState('');
        const [arrayLimit, setArrayLimit] = useState(10);
        const [limitObjectKeys, setLimitObjectKeys] = useState(false);
        const [objectKeyLimit, setObjectKeyLimit] = useState(10);
        const [addPlaceholder, setAddPlaceholder] = useState(true);
        const [stats, setStats] = useState(null);
        const [error, setError] = useState(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const fileInputRef = useRef(null);

        // Handle file upload
        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                setInputJson(e.target.result);
                setError(null);
            };
            reader.onerror = () => setError('Failed to read file');
            reader.readAsText(file);
        };

        // Handle recursive truncation
        const processJson = () => {
            setIsProcessing(true);
            setError(null);
            setStats(null);

            setTimeout(() => {
                try {
                    if (!inputJson.trim()) {
                        throw new Error("Input is empty");
                    }

                    const parsed = JSON.parse(inputJson);
                    let arraysTruncated = 0;
                    let objectsTruncated = 0;
                    let itemsRemoved = 0;

                    const truncateRecursive = (data) => {
                        if (Array.isArray(data)) {
                            if (data.length > arrayLimit) {
                                arraysTruncated++;
                                itemsRemoved += (data.length - arrayLimit);
                                
                                // Slice the array
                                const sliced = data.slice(0, arrayLimit).map(truncateRecursive);
                                
                                // Optional: Add a placeholder string to indicate missing data to the AI
                                if (addPlaceholder) {
                                    sliced.push(`... [${data.length - arrayLimit} items truncated] ...`);
                                }
                                return sliced;
                            }
                            return data.map(truncateRecursive);
                        } else if (data !== null && typeof data === 'object') {
                            const keys = Object.keys(data);
                            
                            // Logic for truncating object keys if enabled
                            if (limitObjectKeys && keys.length > objectKeyLimit) {
                                objectsTruncated++;
                                itemsRemoved += (keys.length - objectKeyLimit);
                                
                                const newObj = {};
                                keys.slice(0, objectKeyLimit).forEach(key => {
                                    newObj[key] = truncateRecursive(data[key]);
                                });
                                
                                if (addPlaceholder) {
                                    newObj["_truncation_notice"] = `... [${keys.length - objectKeyLimit} keys truncated] ...`;
                                }
                                return newObj;
                            }

                            // Standard recursion for objects
                            const newObj = {};
                            keys.forEach(key => {
                                newObj[key] = truncateRecursive(data[key]);
                            });
                            return newObj;
                        }
                        return data;
                    };

                    const processed = truncateRecursive(parsed);
                    const resultString = JSON.stringify(processed, null, 2);
                    
                    setOutputJson(resultString);
                    
                    // Calculate savings
                    const originalSize = new Blob([inputJson]).size;
                    const newSize = new Blob([resultString]).size;
                    
                    setStats({
                        originalSize: (originalSize / 1024).toFixed(2) + ' KB',
                        newSize: (newSize / 1024).toFixed(2) + ' KB',
                        reduction: ((1 - newSize/originalSize) * 100).toFixed(1) + '%',
                        arraysTruncated,
                        objectsTruncated,
                        itemsRemoved
                    });

                } catch (err) {
                    setError(err.message === "Input is empty" ? "Please paste JSON or upload a file." : "Invalid JSON detected. Please check your syntax.");
                } finally {
                    setIsProcessing(false);
                }
            }, 100);
        };

        const copyToClipboard = () => {
            if (!outputJson) return;
            navigator.clipboard.writeText(outputJson);
        };

        const downloadJson = () => {
            if (!outputJson) return;
            const blob = new Blob([outputJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'truncated_config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        // Adapted UI without the main header since the App shell provides it
        // Using vscode properties where possible or mapping colors
        return (
            <div className="h-full flex flex-col">
                {/* Internal Header / Stats bar */}
                {stats && (
                    <div className="mb-6 flex justify-end">
                        <div className="flex gap-4 text-sm bg-vscode-button/20 p-3 rounded-lg border border-vscode-border">
                            <div className="flex flex-col">
                                <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">Reduction</span>
                                <span className="text-green-400 font-mono font-bold">{stats.reduction}</span>
                            </div>
                            <div className="w-px bg-vscode-border"></div>
                            <div className="flex flex-col">
                                <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">Size</span>
                                <span className="text-vscode-text font-mono">{stats.originalSize} → {stats.newSize}</span>
                            </div>
                            <div className="w-px bg-vscode-border hidden sm:block"></div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">Removed</span>
                                <span className="text-vscode-text font-mono">{stats.itemsRemoved} items</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    
                    {/* Input Column */}
                    <div className="flex flex-col gap-4 h-full min-h-[300px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-vscode-text-muted uppercase tracking-wider flex items-center gap-2">
                                <FileJson className="w-4 h-4" /> Source JSON
                            </h2>
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="text-xs flex items-center gap-2 bg-vscode-button hover:bg-vscode-button-hover text-white px-3 py-1.5 rounded-md transition-colors"
                            >
                                <Upload className="w-3 h-3" /> Upload File
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".json"
                                className="hidden"
                            />
                        </div>
                        <textarea
                            className="flex-1 bg-vscode-input border border-vscode-border rounded-xl p-4 font-mono text-sm text-vscode-text focus:ring-2 focus:ring-vscode-accent focus:border-transparent outline-none resize-none scrollbar-thin scrollbar-thumb-vscode-border scrollbar-track-transparent placeholder-vscode-text-dim"
                            placeholder="Paste your JSON here or upload a file..."
                            value={inputJson}
                            onChange={(e) => setInputJson(e.target.value)}
                            spellCheck="false"
                        />
                    </div>

                    {/* Controls Column */}
                    <div className="flex flex-col gap-6 justify-center lg:px-4 order-last lg:order-none">
                        <div className="bg-vscode-sidebar rounded-2xl p-6 border border-vscode-border shadow-xl">
                            <div className="flex items-center gap-2 mb-6 text-vscode-accent">
                                <Settings className="w-5 h-5" />
                                <h3 className="font-semibold">Configuration</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Array Limit */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-vscode-text flex justify-between">
                                        <span>Max Array Items</span>
                                        <span className="text-vscode-accent font-mono">{arrayLimit}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={arrayLimit}
                                        onChange={(e) => setArrayLimit(parseInt(e.target.value))}
                                        className="w-full h-2 bg-vscode-input rounded-lg appearance-none cursor-pointer accent-vscode-accent"
                                    />
                                    <p className="text-xs text-vscode-text-muted">Truncates any list longer than {arrayLimit} items.</p>
                                </div>

                                <hr className="border-vscode-border" />

                                {/* Object Limit (Toggle) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-vscode-text">Limit Object Keys</label>
                                        <button
                                            onClick={() => setLimitObjectKeys(!limitObjectKeys)}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${limitObjectKeys ? 'bg-vscode-accent' : 'bg-vscode-input'}`}
                                        >
                                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${limitObjectKeys ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    
                                    {limitObjectKeys && (
                                        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between text-xs text-vscode-text-muted">
                                                <span>Limit</span>
                                                <span className="font-mono text-vscode-accent">{objectKeyLimit}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={objectKeyLimit}
                                                onChange={(e) => setObjectKeyLimit(parseInt(e.target.value))}
                                                className="w-full h-2 bg-vscode-input rounded-lg appearance-none cursor-pointer accent-vscode-accent"
                                            />
                                            <p className="text-xs text-orange-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Useful for large map/dictionary structures.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <hr className="border-vscode-border" />

                                {/* Placeholder Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-vscode-text">Add "...truncated" marker</label>
                                    <button
                                        onClick={() => setAddPlaceholder(!addPlaceholder)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${addPlaceholder ? 'bg-vscode-accent' : 'bg-vscode-input'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${addPlaceholder ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={processJson}
                                disabled={isProcessing || !inputJson}
                                className="w-full mt-8 bg-vscode-button hover:bg-vscode-button-hover disabled:bg-vscode-input disabled:text-vscode-text-muted disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-vscode-accent/10 flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isProcessing ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Process JSON <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-200 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex flex-col gap-4 h-full min-h-[300px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-vscode-text-muted uppercase tracking-wider flex items-center gap-2">
                                <Check className="w-4 h-4" /> Result
                            </h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={copyToClipboard}
                                    disabled={!outputJson}
                                    className="text-xs flex items-center gap-2 bg-vscode-button hover:bg-vscode-button-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                                <button 
                                    onClick={downloadJson}
                                    disabled={!outputJson}
                                    className="text-xs flex items-center gap-2 bg-vscode-button hover:bg-vscode-button-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <Download className="w-3 h-3" /> Download
                                </button>
                            </div>
                        </div>
                        <textarea
                            readOnly
                            className="flex-1 bg-vscode-input/50 border border-vscode-border rounded-xl p-4 font-mono text-sm text-green-400 focus:ring-2 focus:ring-green-500/50 focus:border-transparent outline-none resize-none scrollbar-thin scrollbar-thumb-vscode-border scrollbar-track-transparent"
                            placeholder="Processed JSON will appear here..."
                            value={outputJson}
                        />
                    </div>

                </div>
            </div>
        );
    }

    // Register the component to the window
    window.JsonTruncator = JsonTruncator;
})();
