// .github/scripts/generate-index.js
//
// Generates tools/repo-tools.js by scanning this repository for HTML files.
// Also injects Google Analytics into HTML files that don't already have it.
//
// This script intentionally avoids calling the GitHub Contents API.
// Relying on the API can lead to empty output due to missing User-Agent headers,
// rate limits, or network failures.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.join(__dirname, '..', '..');

const googleAnalyticsScript = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-LL3LWXVBHR"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'G-LL3LWXVBHR');
    </script>
`;

const googleAnalyticsId = 'G-LL3LWXVBHR';

const SKIP_FILES = new Set([
    'index.html',
    'index_template.html',
    'robots.txt'
]);

const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    '.github',
    'tools',
    'qr-deeplink',
]);

function toPosixPath(p) {
    return p.split(path.sep).join('/');
}

function categoryFromPath(fullPath) {
    const parts = fullPath.split('/');
    if (parts.length <= 1) return 'Misc';
    const dir = parts[parts.length - 2];
    return dir ? (dir.charAt(0).toUpperCase() + dir.slice(1)) : 'Misc';
}

function toolIdFromPath(fullPath) {
    // Unique, stable id across folders
    return fullPath
        .toLowerCase()
        .replace(/\.html$/i, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function hashStringToUint32(str) {
    // FNV-1a 32-bit
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function thumbnailUrlFromTitle(pageTitle) {
    const title = (pageTitle || '').trim();
    if (!title) return '';

    // Unofficial Bing thumbnail endpoint (query -> thumbnail)
    // Note: This is not a supported/official API and may change.
    return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(title)}&w=640&h=360&c=7&rs=1&p=0`;
}

async function readHtmlTitleFromDisk(relativePath) {
    const absPath = path.join(repoRoot, relativePath);
    try {
        const htmlContent = await fs.readFile(absPath, 'utf8');
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/is);
        return titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';
    } catch (error) {
        console.error(`Error reading/parsing HTML title from ${relativePath}:`, error);
        return '';
    }
}

async function addGoogleAnalytics(absFilePath) {
    try {
        let content = await fs.readFile(absFilePath, 'utf8');

        // Check if Google Analytics script already exists
        if (content.includes(`gtag('config', '${googleAnalyticsId}')`)) {
            return false;
        }

        // Inject script before closing </head> tag
        const headEndTag = '</head>';
        if (content.includes(headEndTag)) {
            content = content.replace(headEndTag, `${googleAnalyticsScript}\n${headEndTag}`);
            await fs.writeFile(absFilePath, content);
            return true;
        }

        console.warn(`Could not find </head> tag in ${absFilePath}. Skipping Google Analytics.`);
        return false;
    } catch (error) {
        console.error(`Error adding Google Analytics to ${absFilePath}:`, error);
        return false;
    }
}

async function findHtmlFiles(relativeDir = '') {
    const absDir = path.join(repoRoot, relativeDir);

    let entries;
    try {
        entries = await fs.readdir(absDir, { withFileTypes: true });
    } catch (err) {
        console.error(`Failed to read directory ${absDir}:`, err);
        return [];
    }

    const results = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;

            const childRelDir = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
            results.push(...(await findHtmlFiles(childRelDir)));
            continue;
        }

        if (!entry.isFile()) continue;
        if (!entry.name.toLowerCase().endsWith('.html')) continue;
        if (SKIP_FILES.has(entry.name)) continue;
        if (entry.name.toLowerCase().endsWith('.svg')) continue;

        const relPath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
        results.push(toPosixPath(relPath));
    }

    return results;
}

async function getProjectDetails(fullPath) {
    const parts = fullPath.split('/');
    const filename = parts[parts.length - 1];

    // Main display title derived from the filename (e.g., "Auto Tower Defense")
    let displayTitle = filename.replace(/\.html$/i, '').replace(/-/g, ' ');
    displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);

    // Prepend the directory name to the display title for better context, if applicable
    const directoryPath = parts.slice(0, -1).join('/');
    if (directoryPath) {
        const displayDirectory = directoryPath.split('/').pop();
        displayTitle = `${displayDirectory.charAt(0).toUpperCase() + displayDirectory.slice(1)}: ${displayTitle}`;
    }

    const htmlPageTitle = await readHtmlTitleFromDisk(fullPath);
    const description = htmlPageTitle || `A project located at /${fullPath}`;

    // Encode spaces etc. so window.open works reliably
    const url = encodeURI(`/${fullPath}`);

    return { title: displayTitle, description, url };
}

async function generateIndexFile() {
    console.log('Starting tools generation and HTML file modification...');

    const htmlFiles = await findHtmlFiles('');

    // Deterministic order
    htmlFiles.sort((a, b) => a.localeCompare(b));

    const tools = [];

    for (const fullPath of htmlFiles) {
        const details = await getProjectDetails(fullPath);

        // Inject GA into the actual HTML file
        await addGoogleAnalytics(path.join(repoRoot, fullPath));

        tools.push({
            id: toolIdFromPath(fullPath),
            name: details.title,
            description: details.description,
            url: details.url,
            thumbnailUrl: thumbnailUrlFromTitle(details.description || details.title),
            icon: 'FileText',
            category: categoryFromPath(fullPath)
        });
    }

    // Sort by category then name
    tools.sort((a, b) => {
        const c = a.category.localeCompare(b.category);
        if (c !== 0) return c;
        return a.name.localeCompare(b.name);
    });

    const toolsJsContent = `window.RepoTools = ${JSON.stringify(tools, null, 4)};`;

    const toolsOutputPath = path.join(repoRoot, 'tools', 'repo-tools.js');
    await fs.mkdir(path.dirname(toolsOutputPath), { recursive: true });
    await fs.writeFile(toolsOutputPath, toolsJsContent);

    // Ensure GA is also present in the custom index.html
    await addGoogleAnalytics(path.join(repoRoot, 'index.html'));

    console.log(`Generated ${toolsOutputPath} (${tools.length} tools)`);
    console.log('All HTML files processed for Google Analytics successfully!');
}

generateIndexFile();
