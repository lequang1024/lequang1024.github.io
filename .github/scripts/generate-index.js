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
function renderTreeHtml(items, level = 0) {
    let html = '<ul class="list-none p-0 m-0">'; // Add base list classes

    for (const item of items) {
        if (item.type === 'dir') {
            const folderName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            html += `
                <li>
                    <div class="folder-item flex items-center pl-${2 + level * 2}" data-expanded="false">
                        <span class="folder-toggle-icon text-gray-500">&#9658;</span>
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">${folderName}</span>
                    </div>
                    <div class="folder-contents hidden">
                        ${renderTreeHtml(item.children, level + 1)}
                    </div>
                </li>
            `;
        } else if (item.type === 'file') {
            html += `
                <li>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="file-item block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200">
                        <h3 class="text-md font-medium">${item.title}</h3>
                        ${item.description ? `<p class="project-description">${item.description}</p>` : ''}
                    </a>
                </li>
            `;
        }
    }
    html += '</ul>';
    return html;
}

// --- Main Script Execution ---
async function generateIndexFile() {
    console.log('Starting index.html generation and HTML file modification...');

    // Fetch and process all repository contents
    // This step will now also trigger Google Analytics injection for each HTML file encountered
    const rootItems = await fetchContents(apiUrl);
    const structuredItems = await processItems(rootItems); // This is where the recursive GA injection happens

    // Render the HTML tree structure for index.html
    const treeHtml = renderTreeHtml(structuredItems);

    // Read the template index.html
    let indexTemplateContent;
    const indexTemplatePath = path.join(__dirname, '..', '..', 'index_template.html');
    try {
        indexTemplateContent = await fs.readFile(indexTemplatePath, 'utf8');
    } catch (error) {
        console.error("Error reading index_template.html:", error);
        // Fallback to a basic template if file not found
        indexTemplateContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quang Le — Project Tools</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>
        body { font-family: 'Inter', sans-serif; }
        .folder-item { cursor: pointer; user-select: none; padding: 8px 0; border-radius: 8px; margin-bottom: 4px; display: flex; align-items: center; transition: background-color 0.1s ease; }
        .folder-item:hover { background-color: #f3f4f6; }
        .folder-toggle-icon { margin-right: 8px; width: 16px; height: 16px; flex-shrink: 0; display: inline-block; transition: transform 0.2s ease; transform-origin: center center; }
        .folder-item[data-expanded="true"] .folder-toggle-icon { transform: rotate(90deg); }
        .folder-icon { margin-left: 4px; margin-right: 8px; font-size: 1.2em; line-height: 1; flex-shrink: 0; }
        .folder-name { font-weight: 600; color: #4f46e5; }
        .folder-contents { margin-left: 24px; list-style: none; padding: 0; overflow: hidden; transition: max-height 0.3s ease-out, opacity 0.3s ease-out; }
        .folder-contents.hidden { max-height: 0; opacity: 0; }
        .folder-contents:not(.hidden) { max-height: 1000px; opacity: 1; }
        .file-item { padding: 6px 0; border-radius: 8px; margin-bottom: 2px; }
        .file-item a { display: block; padding: 4px 8px; border-radius: 8px; color: #374151; text-decoration: none; transition: background-color 0.1s ease, color 0.1s ease; }
        .file-item a:hover { background-color: #e5e7eb; color: #1f2937; }
        .project-description { font-size: 0.75rem; color: #6b7280; margin-top: 4px; white-space: pre-wrap; max-height: 60px; overflow: hidden; text-overflow: ellipsis; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800 min-h-screen flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-4xl">
        <header class="text-center mb-12">
            <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                Quang Le's Tools
            </h1>
            <p class="mt-3 text-gray-600 text-lg">
                Simple, useful utilities — hosted on GitHub Pages
            </p>
        </header>
        <main id="project-tree" class="bg-white rounded-2xl p-6 shadow border border-gray-200">
            </main>
        <footer class="mt-16 text-center text-sm text-gray-500">
            &copy; <script>document.write(new Date().getFullYear())</script> Quang Le. Built with ❤️ using GitHub Pages.
        </footer>
    </div>
    <script>
        // Client-side JavaScript for handling folder expansion/collapse
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.folder-item').forEach(folderDiv => {
                folderDiv.addEventListener('click', () => {
                    const folderContentsList = folderDiv.nextElementSibling; // The <ul> immediately after the folderDiv
                    const isHidden = folderContentsList.classList.contains('hidden');
                    folderContentsList.classList.toggle('hidden');
                    folderDiv.setAttribute('data-expanded', isHidden ? 'true' : 'false');
                });
            });
        });
    </script>
</body>
</html>
        `;
    }

    // Replace the placeholder with the generated tree HTML
    let finalHtml = indexTemplateContent.replace('<!-- PROJECT_TREE_PLACEHOLDER -->', treeHtml);

    // Add Google Analytics to the generated index.html itself
    const indexOutputPath = path.join(__dirname, '..', '..', 'index.html');
    await fs.writeFile(indexOutputPath, finalHtml); // Write without GA first to re-read
    await addGoogleAnalytics(indexOutputPath); // Then add GA to it

    console.log('index.html generated and all HTML files processed for Google Analytics successfully!');
}

generateIndexFile();