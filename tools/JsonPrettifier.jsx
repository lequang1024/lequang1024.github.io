// tools/JsonPrettifier.jsx

// @tool name: JSON Prettifier
// @tool description: Format and beautify JSON with proper indentation and syntax highlighting
// @tool icon: FileJson
// @tool category: Data

(function() {
    const { useState, useRef } = React;

    function JsonPrettifier() {
        // Access shared icons (lazily to ensure window.Icons is defined)
        const { FileJson, Upload, Copy, Download, RefreshCw, AlertCircle, Check } = window.Icons;

        const [inputJson, setInputJson] = useState('');
        const [outputJson, setOutputJson] = useState('');
        const [indentation, setIndentation] = useState(2);
        const [extractFromLogs, setExtractFromLogs] = useState(true);
        const [stats, setStats] = useState(null);
        const [error, setError] = useState(null);
        const [isProcessing, setIsProcessing] = useState(false);
        const fileInputRef = useRef(null);

        // Extract JSON from log text
        const extractJsonFromText = (text) => {
            // Look for JSON objects starting with { and ending with }
            const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
            if (jsonMatch && jsonMatch.length > 0) {
                // Find the longest match (most complete JSON)
                return jsonMatch.reduce((longest, current) =>
                    current.length > longest.length ? current : longest
                );
            }
            return text;
        };

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

        // Format JSON
        const formatJson = () => {
            setIsProcessing(true);
            setError(null);
            setStats(null);

            setTimeout(() => {
                try {
                    if (!inputJson.trim()) {
                        throw new Error("Input is empty");
                    }

                    let jsonToParse = inputJson;

                    // Extract JSON from logs if enabled
                    if (extractFromLogs) {
                        jsonToParse = extractJsonFromText(inputJson);
                    }

                    const parsed = JSON.parse(jsonToParse);
                    const formatted = JSON.stringify(parsed, null, indentation);

                    setOutputJson(formatted);

                    // Calculate stats
                    const originalSize = new Blob([inputJson]).size;
                    const formattedSize = new Blob([formatted]).size;

                    setStats({
                        originalSize: (originalSize / 1024).toFixed(2) + ' KB',
                        formattedSize: (formattedSize / 1024).toFixed(2) + ' KB',
                        change: formattedSize > originalSize ?
                            '+' + ((formattedSize/originalSize - 1) * 100).toFixed(1) + '%' :
                            ((1 - formattedSize/originalSize) * 100).toFixed(1) + '% smaller',
                        extracted: extractFromLogs && jsonToParse !== inputJson
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
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        return (
            <div className="h-full flex flex-col">
                {/* Stats bar */}
                {stats && (
                    <div className="mb-6 flex justify-end">
                        <div className="flex gap-4 text-sm bg-vscode-button/20 p-3 rounded-lg border border-vscode-border">
                            {stats.extracted && (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">JSON Extracted</span>
                                        <span className="text-green-400 font-mono font-bold">✓</span>
                                    </div>
                                    <div className="w-px bg-vscode-border"></div>
                                </>
                            )}
                            <div className="flex flex-col">
                                <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">Size Change</span>
                                <span className={`font-mono font-bold ${stats.change.includes('+') ? 'text-orange-400' : 'text-green-400'}`}>
                                    {stats.change}
                                </span>
                            </div>
                            <div className="w-px bg-vscode-border"></div>
                            <div className="flex flex-col">
                                <span className="text-vscode-text-muted uppercase text-xs font-bold tracking-wider">Size</span>
                                <span className="text-vscode-text font-mono">{stats.originalSize} → {stats.formattedSize}</span>
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
                                <FileJson className="w-5 h-5" />
                                <h3 className="font-semibold">Formatting Options</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Extract from logs */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-vscode-text">Extract JSON from logs</label>
                                    <button
                                        onClick={() => setExtractFromLogs(!extractFromLogs)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${extractFromLogs ? 'bg-vscode-accent' : 'bg-vscode-input'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${extractFromLogs ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <hr className="border-vscode-border" />

                                {/* Indentation */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-vscode-text flex justify-between">
                                        <span>Indentation</span>
                                        <span className="text-vscode-accent font-mono">{indentation} spaces</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="8"
                                        value={indentation}
                                        onChange={(e) => setIndentation(parseInt(e.target.value))}
                                        className="w-full h-2 bg-vscode-input rounded-lg appearance-none cursor-pointer accent-vscode-accent"
                                    />
                                    <p className="text-xs text-vscode-text-muted">
                                        {indentation === 0 ? 'Compact (no indentation)' : `${indentation} spaces per level`}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={formatJson}
                                disabled={isProcessing || !inputJson}
                                className="w-full mt-8 bg-vscode-button hover:bg-vscode-button-hover disabled:bg-vscode-input disabled:text-vscode-text-muted disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-vscode-accent/10 flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isProcessing ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Format JSON <Check className="w-5 h-5" />
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
                                <Check className="w-4 h-4" /> Formatted JSON
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
                            placeholder="Formatted JSON will appear here..."
                            value={outputJson}
                        />
                    </div>

                </div>
            </div>
        );
    }

    // Register the component to the window
    window.JsonPrettifier = JsonPrettifier;
})();