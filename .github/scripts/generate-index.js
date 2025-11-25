// .github/scripts/generate-index.js

import fetch from 'node-fetch';
import fs from 'fs/promises'; // For asynchronous file operations
import path from 'path';     // For path manipulation
import { fileURLToPath } from 'url'; // To get __dirname in ES modules

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const repoOwner = 'lequang1024';
const repoName = 'lequang1024.github.io';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;
const rawContentBaseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/`; // Assuming 'main' branch

const googleAnalyticsScript = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-LL3LWXVBHR"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'G-LL3LWXVBHR');
    </script>
`;
const googleAnalyticsId = 'G-LL3LWXVBHR'; // Used for checking existence

// --- Utility Functions ---

/**
 * Fetches contents of a given GitHub API URL (either repository root or a directory).
 * Handles network errors gracefully.
 * @param {string} url - The GitHub API URL to fetch from (e.g., 'https://api.github.com/.../contents/Games').
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of content items (files/dirs).
 */
async function fetchContents(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch contents: ${response.statusText} (${response.status}) from ${url}`);
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching contents from ${url}:`, error);
        return [];
    }
}

/**
 * Fetches the content of an HTML file and extracts its <title> tag.
 * @param {string} htmlPath - The full relative path to the HTML file (e.g., 'Games/my-game.html').
 * @returns {Promise<string>} A promise that resolves with the content of the <title> tag, or an empty string if not found/error.
 */
async function fetchHtmlTitle(htmlPath) {
    const htmlUrl = rawContentBaseUrl + htmlPath;
    try {
        const response = await fetch(htmlUrl);
        if (!response.ok) {
            console.warn(`Failed to fetch HTML from ${htmlUrl}: ${response.statusText}`);
            return '';
        }
        const htmlContent = await response.text();
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
        return titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';
    } catch (error) {
        console.error(`Error fetching or parsing HTML title from ${htmlUrl}:`, error);
        return '';
    }
}

/**
 * Adds Google Analytics tracking code to an HTML file if it doesn't already exist.
 * Reads the file, checks for the script, and writes back if modified.
 * @param {string} filePath - The absolute path to the HTML file on the runner.
 * @returns {Promise<boolean>} True if the file was modified, false otherwise.
 */
async function addGoogleAnalytics(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');

        // Check if Google Analytics script already exists
        if (content.includes(`gtag('config', '${googleAnalyticsId}')`)) {
            console.log(`Google Analytics already present in ${filePath}. Skipping.`);
            return false;
        }

        // Inject script before closing </head> tag
        const headEndTag = '</head>';
        if (content.includes(headEndTag)) {
            content = content.replace(headEndTag, `${googleAnalyticsScript}\n${headEndTag}`);
            await fs.writeFile(filePath, content);
            console.log(`Added Google Analytics to ${filePath}`);
            return true;
        } else {
            console.warn(`Could not find </head> tag in ${filePath}. Skipping Google Analytics.`);
            return false;
        }
    } catch (error) {
        console.error(`Error adding Google Analytics to ${filePath}:`, error);
        return false;
    }
}

/**
 * Generates display details (title, description, and the correct URL) for a given file path.
 * The description is now taken from the HTML file's <title> tag.
 * @param {string} fullPath - The full relative path of the file (e.g., 'Games/auto-tower-defense-game.html').
 * @returns {Promise<{title: string, description: string, url: string}>} An object with the formatted title, description, and the relative URL for linking.
 */
async function getProjectDetails(fullPath) {
    const parts = fullPath.split('/');
    const filename = parts[parts.length - 1];

    // Main display title derived from the filename (e.g., "Auto Tower Defense")
    let displayTitle = filename.replace('.html', '').replace(/-/g, ' ');
    displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);

    // Prepend the directory name to the display title for better context, if applicable
    const directoryPath = parts.slice(0, -1).join('/');
    if (directoryPath) {
        const displayDirectory = directoryPath.split('/').pop();
        displayTitle = `${displayDirectory.charAt(0).toUpperCase() + displayDirectory.slice(1)}: ${displayTitle}`;
    }

    // Fetch the <title> from the HTML file to use as the description
    const htmlPageTitle = await fetchHtmlTitle(fullPath);
    const description = htmlPageTitle || `A project located at /${fullPath}`; // Fallback description

    // The URL for GitHub Pages is the full path relative to the root
    const projectUrl = `/${fullPath}`;

    return { title: displayTitle, description: description, url: projectUrl };
}


/**
 * Processes a list of items (files and directories) and prepares them for rendering.
 * Recursively fetches contents of subdirectories and adds analytics to HTML files.
 * @param {Array<Object>} items - An array of GitHub API content items.
 * @param {string} currentPath - The current logical path relative to the repository root.
 * @returns {Promise<Array<Object>>} A structured array of items with 'children' for directories.
 */
async function processItems(items, currentPath = '') {
    const processed = [];
    for (const item of items) {
        // Skip irrelevant files like the generated index.html, index_template.html, robots.txt, and SVG images
        if (item.name === 'index.html' || item.name === 'index_template.html' || item.name === 'robots.txt' || item.name.endsWith('.svg')) {
            continue;
        }

        const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        // Construct the local file path on the runner for read/write operations
        const localFilePath = path.join(__dirname, '..', '..', fullPath);

        if (item.type === 'dir') {
            const children = await fetchContents(item.url);
            const processedChildren = await processItems(children, fullPath); // Recursively process children
            // Only add directory if it contains HTML files or other sub-directories with HTML files
            if (processedChildren.some(child => child.type === 'file' || (child.type === 'dir' && child.children.length > 0))) {
                processed.push({
                    name: item.name,
                    type: 'dir',
                    children: processedChildren,
                });
            }
        } else if (item.type === 'file' && item.name.endsWith('.html')) {
            const details = await getProjectDetails(fullPath); // Fetches title for display
            
            // IMPORTANT: Add Google Analytics to the *actual* HTML file
            await addGoogleAnalytics(localFilePath); // This modifies the file on disk

            processed.push({
                name: item.name,
                type: 'file',
                title: details.title,
                description: details.description,
                url: details.url,
            });
        }
    }

    // Sort items: directories first, then files. Both are sorted alphabetically by name.
    processed.sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
    });

    return processed;
}


/**
 * Renders the processed items into an HTML string for the tree structure.
 * @param {Array<Object>} items - The structured array of items (from processItems).
 * @param {number} level - Current indentation level for visual hierarchy.
 * @returns {string} The HTML string representing the tree.
*/
function flattenTools(items, category = 'Misc') {
    let tools = [];
    for (const item of items) {
        if (item.type === 'file') {
            tools.push({
                id: item.name.toLowerCase().replace(/\./g, '-'),
                name: item.title || item.name,
                description: item.description || '',
                url: item.url,
                icon: 'FileText',
                category: category
            });
        } else if (item.type === 'dir') {
            // Use directory name as category, capitalised
            const newCategory = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            tools = tools.concat(flattenTools(item.children, newCategory));
        }
    }
    return tools;
}

// --- Main Script Execution ---
async function generateIndexFile() {
    console.log('Starting index.html generation and HTML file modification...');

    // Fetch and process all repository contents
    // This step will now also trigger Google Analytics injection for each HTML file encountered
    const rootItems = await fetchContents(apiUrl);
    const structuredItems = await processItems(rootItems); // This is where the recursive GA injection happens
    
    // Generate the tools list for the React App
    const flatTools = flattenTools(structuredItems);
    const toolsJsContent = `window.RepoTools = ${JSON.stringify(flatTools, null, 4)};`;

    // Write to tools/repo-tools.js
    const toolsOutputPath = path.join(__dirname, '..', '..', 'tools', 'repo-tools.js');
    // Ensure directory exists (it should, but safe to check if we were robust, here we assume tools/ exists)
    try {
        await fs.writeFile(toolsOutputPath, toolsJsContent);
        console.log(`Generated ${toolsOutputPath}`);
    } catch (err) {
        console.error("Error writing repo-tools.js:", err);
    }

    // Generate JSX tools
    const jsxTools = [];
    const toolsDir = path.join(__dirname, '..', '..', 'tools');
    try {
        const files = await fs.readdir(toolsDir);
        for (const file of files.filter(f => f.endsWith('.jsx'))) {
            const filePath = path.join(toolsDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            const metadata = {};
            const toolRegex = /\/\/ @tool (\w+): (.+)/g;
            let match;
            while ((match = toolRegex.exec(content)) !== null) {
                const key = match[1];
                const value = match[2].trim();
                metadata[key] = value;
            }
            const componentName = file.replace('.jsx', '');
            const id = metadata.id || componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
            const name = metadata.name || componentName.replace(/([A-Z])/g, ' $1').trim();
            const description = metadata.description || `A tool for ${name.toLowerCase()}`;
            const icon = metadata.icon || 'Wrench';
            const category = metadata.category || 'Utility';
            jsxTools.push({
                id,
                name,
                description,
                icon,
                category,
                component: componentName
            });
        }
    } catch (err) {
        console.error('Error processing JSX tools:', err);
    }
    const jsxToolsJsContent = `window.JsxTools = ${JSON.stringify(jsxTools, null, 4)};`;
    const jsxToolsPath = path.join(toolsDir, 'jsx-tools.js');
    try {
        await fs.writeFile(jsxToolsPath, jsxToolsJsContent);
        console.log(`Generated ${jsxToolsPath}`);
    } catch (err) {
        console.error("Error writing jsx-tools.js:", err);
    }

    // Generate script loading tags for JSX files and inject into index.html
    const jsxScriptTags = jsxTools.map(tool => {
        const fileName = `${tool.component}.jsx`;
        return `    <script type="text/babel" src="tools/${fileName}"></script>`;
    }).join('\n');
    
    // Update index.html to include JSX loaders
    const indexPath = path.join(__dirname, '..', '..', 'index.html');
    try {
        let indexContent = await fs.readFile(indexPath, 'utf8');
        
        // Find the comment marker and replace with actual script tags
        const marker = '<!-- Auto-generated JSX component loaders -->';
        if (indexContent.includes(marker)) {
            indexContent = indexContent.replace(marker, `${marker}\n${jsxScriptTags}`);
            await fs.writeFile(indexPath, indexContent);
            console.log(`Updated ${indexPath} with JSX loader script tags`);
        } else {
            console.warn('Could not find JSX loaders marker in index.html');
        }
    } catch (err) {
        console.error("Error updating index.html with JSX loaders:", err);
    }
    
    // Add Google Analytics to the custom index.html
    const indexOutputPath = path.join(__dirname, '..', '..', 'index.html');
    await addGoogleAnalytics(indexOutputPath);

    console.log('index.html generated and all HTML files processed for Google Analytics successfully!');
}

generateIndexFile();
