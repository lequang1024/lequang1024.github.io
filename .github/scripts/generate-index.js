// .github/scripts/generate-index.js

import fetch from 'node-fetch';
import fs from 'fs/promises'; // For asynchronous file operations
import path from 'path';     // For path manipulation
import { fileURLToPath } from 'url'; // To get __dirname in ES modules
import showdown from 'showdown'; // For Markdown to HTML conversion

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Converter for Markdown to HTML
const converter = new showdown.Converter();
converter.setOption('omitExtraWLInKeptHtml', true);
converter.setOption('simplifiedAutoLink', true);
converter.setOption('parseImgDimensions', true);
converter.setOption('tables', true);
converter.setOption('tasklists', true);


// --- Configuration ---
const repoOwner = 'lequang1024';
const repoName = 'lequang1024.github.io';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;
const rawContentBaseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/`; // Assuming 'main' branch

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
 * Fetches the raw content of a README.md file and converts it to plain text.
 * @param {string} readmePath - The full relative path to the README.md file (e.g., 'Games/README.md').
 * @returns {Promise<string>} A promise that resolves with the plain text content of the README.md, or an empty string if not found/error.
 */
async function fetchReadmeContent(readmePath) {
    const readmeUrl = rawContentBaseUrl + readmePath;
    try {
        const response = await fetch(readmeUrl);
        if (!response.ok) {
            if (response.status === 404) {
                // console.warn(`No README.md found at: ${readmeUrl}`);
            } else {
                console.warn(`Failed to fetch README.md from ${readmeUrl}: ${response.statusText}`);
            }
            return '';
        }
        const markdown = await response.text();
        // Convert Markdown to HTML, then strip HTML tags to get plain text.
        // This is a simplified approach to get a clean text summary.
        // For full fidelity, you might render the HTML directly.
        let htmlContent = converter.makeHtml(markdown);

        // Remove HTML tags for a plain text summary, and clean up extra whitespace
        let plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\s\s+/g, ' ').trim();

        // Limit the length of the description to avoid overly long text
        const maxLength = 200; // Adjust as needed
        if (plainText.length > maxLength) {
            plainText = plainText.substring(0, maxLength).trim() + '...';
        }

        return plainText;
    } catch (error) {
        console.error(`Error fetching or processing README content from ${readmeUrl}:`, error);
        return '';
    }
}

/**
 * Generates display details (title, description, and the correct URL) for a given file path.
 * This function now also fetches README content.
 * @param {string} fullPath - The full relative path of the file (e.g., 'Games/auto-tower-defense-game.html').
 * @returns {Promise<{title: string, description: string, url: string}>} An object with the formatted title, description, and the relative URL for linking.
 */
async function getProjectDetails(fullPath) {
    const parts = fullPath.split('/');
    const filename = parts[parts.length - 1];
    const directoryPath = parts.slice(0, -1).join('/'); // Path to the directory containing the file

    // Default title derived from the filename
    let title = filename.replace('.html', '').replace(/-/g, ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Prepend the directory name to the title for better context, if applicable
    if (directoryPath) {
        const displayDirectory = directoryPath.split('/').pop();
        title = `${displayDirectory.charAt(0).toUpperCase() + displayDirectory.slice(1)}: ${title}`;
    }

    // Construct the path to the potential README.md for this specific project/directory
    // We assume the README for an HTML file is in the same directory as the HTML file itself.
    // If the HTML file is `Games/MyGame/index.html`, we look for `Games/MyGame/README.md`.
    // If the HTML file is `Utils/qr-deeplink.html`, we look for `Utils/README.md`.
    const readmeForHtml = `${directoryPath}/${filename.replace('.html', '')}/README.md`; // For 'index.html' in a subfolder
    const readmeForDir = `${directoryPath}/README.md`; // For standalone HTML files directly in a folder

    let description = '';
    // Prioritize README in a dedicated subfolder (e.g., MyGame/README.md)
    if (filename === 'index.html' && directoryPath) {
        const specificReadmePath = `${directoryPath}/README.md`;
        description = await fetchReadmeContent(specificReadmePath);
    } else {
        // For other HTML files (e.g., qr-deeplink.html), look for a README in the same directory
        description = await fetchReadmeContent(readmeForDir);
    }

    // If no specific README, try to derive a basic description (reverting to previous logic)
    if (!description) {
         switch (filename) {
            case 'qr-deeplink.html':
                description = 'Generate QR codes that trigger deep links — ideal for app routing tests and marketing workflows.';
                break;
            case 'support-code-scraper-tool.html':
                description = 'Paste logs or messages to extract 6-digit support codes and build NCalc expressions for filtering.';
                break;
            case 'datetime-to-ticks.html':
                description = 'Convert ISO date strings into .NET ticks and generate filtering logic for server-side date checks.';
                break;
            case 'auto-tower-defense-game.html':
                description = 'An automated tower defense game. Set up your towers and watch the battle!';
                break;
            default:
                description = `A simple utility or project.`;
        }
    }


    const projectUrl = `/${fullPath}`; // Relative URL for GitHub Pages

    return { title, description, url: projectUrl };
}


/**
 * Processes a list of items (files and directories) and prepares them for rendering.
 * Recursively fetches contents of subdirectories.
 * @param {Array<Object>} items - An array of GitHub API content items.
 * @param {string} currentPath - The current logical path relative to the repository root.
 * @returns {Promise<Array<Object>>} A structured array of items with 'children' for directories.
 */
async function processItems(items, currentPath = '') {
    const processed = [];
    for (const item of items) {
        // Skip irrelevant files
        if (item.name === 'index.html' || item.name === 'robots.txt' || item.name.endsWith('.svg') || item.name.endsWith('.md')) {
            continue;
        }

        const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;

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
            const details = await getProjectDetails(fullPath);
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
    console.log('Starting index.html generation...');

    // Fetch and process all repository contents
    const rootItems = await fetchContents(apiUrl);
    const structuredItems = await processItems(rootItems);

    // Render the HTML tree structure
    const treeHtml = renderTreeHtml(structuredItems);

    // Read the template index.html
    const templatePath = path.join(__dirname, '..', '..', 'index.html.template'); // Adjust path to your template
    let indexTemplateContent;
    try {
        // For local testing, you might need to adjust this path to where your actual index.html is.
        // In the GitHub Action, it will be relative to the checkout root.
        indexTemplateContent = await fs.readFile(path.join(__dirname, '..', '..', 'index_template.html'), 'utf8');
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
            <!-- PROJECT_TREE_PLACEHOLDER -->
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
    const finalHtml = indexTemplateContent.replace('<!-- PROJECT_TREE_PLACEHOLDER -->', treeHtml);

    // Write the final HTML to index.html in the root of the repo
    const outputPath = path.join(__dirname, '..', '..', 'index.html');
    await fs.writeFile(outputPath, finalHtml);

    console.log('index.html generated successfully!');
}

generateIndexFile();
