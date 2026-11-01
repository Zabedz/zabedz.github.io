// Static checks on the build output that a browser would only catch at runtime.
// Usage: [SITE_URL=https://x.github.io/repo/] [BASE_PATH=/repo] node scripts/check-dist.ts [outDir]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const outDir = process.argv[2] ?? 'build';
const siteOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
const basePath = process.env.BASE_PATH ?? '';

const KB = 1024;
const MAX_INITIAL_JS_GZ = 70 * KB;
const MAX_CSS_GZ = 20 * KB;
const MAX_IMAGE = 150 * KB;
const MAX_FONT_FILES = 2;
const MAX_FONTS_TOTAL = 100 * KB;

const TEXT_EXT = /\.(html|js|mjs|css|json|txt|xml|svg|webmanifest)$/;
const IMAGE_EXT = /\.(avif|webp|png|jpe?g|gif|svg)$/;
const FONT_EXT = /\.(woff2?|ttf|otf)$/;
const SVG_ALLOWLIST = new Set(['favicon.svg']);
const SECRET_PATTERNS = [
	/gh[pousr]_[A-Za-z0-9]{36,}/,
	/github_pat_[A-Za-z0-9_]{60,}/,
	/-----BEGIN [A-Z ]*PRIVATE KEY-----/
];
const LOADING_TAGS = /<(script|link|img|source|iframe|video|audio|embed|object)\b[^>]*>/gi;
const FETCHING_RELS =
	/^(stylesheet|preload|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|mask-icon|manifest)$/;
const URL_ATTR =
	/\s(src|href|srcset|imagesrcset|poster|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
const REMOTE_URL = /^(https?:)?\/\//i;
const REMOTE_CSS_URL = /(@import\s+(?:url\()?|url\()\s*["']?((?:https?:)?\/\/[^"')\s]+)/gi;

const errors: string[] = [];
const warnings: string[] = [];

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});
}

const isMissing = (err: unknown) => err instanceof Error && 'code' in err && err.code === 'ENOENT';

function sha256(text: string): string {
	const normalized = text.replace(/\r\n?/g, '\n');
	return `'sha256-${createHash('sha256').update(normalized, 'utf8').digest('base64')}'`;
}

const gzSize = (file: string) => gzipSync(readFileSync(file)).length;
const kb = (bytes: number) => `${(bytes / KB).toFixed(1)} kB`;

function attr(tag: string, name: string): string | undefined {
	const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
	return m?.slice(1).find((v) => v !== undefined);
}

function isRemote(url: string): boolean {
	if (!REMOTE_URL.test(url)) return false;
	if (!siteOrigin) return true;
	return new URL(url, siteOrigin).origin !== siteOrigin;
}

function urlsOf(tag: string): string[] {
	return [...tag.matchAll(URL_ATTR)].flatMap(([, name, ...vals]) => {
		const value = (vals.find((v) => v !== undefined) ?? '').trim();
		return /srcset$/i.test(name ?? '')
			? value.split(/,\s+/).map((c) => c.trim().split(/\s+/)[0] ?? '')
			: [value];
	});
}

// Resolves a URL from a page to a file in outDir, or null if it is not local.
function localFile(pageFile: string, url: string): string | null {
	if (!url || REMOTE_URL.test(url) || /^(data|blob):/i.test(url)) return null;
	const path = url.split(/[?#]/)[0] ?? '';
	if (path.startsWith('/')) return join(outDir, path.slice(basePath.length));
	return join(pageFile, '..', path);
}

function checkCss(where: string, css: string): void {
	for (const [, , url = ''] of css.matchAll(REMOTE_CSS_URL)) {
		if (isRemote(url)) errors.push(`${where}: third-party CSS resource: ${url}`);
	}
}

function checkSvg(where: string, svg: string): void {
	const name = where.split('/').pop() ?? '';
	if (!SVG_ALLOWLIST.has(name))
		errors.push(`${where}: SVG outside the allowlist; project images are AVIF`);
	const unsafe = [
		/<script\b/i,
		/\son[a-z]+\s*=/i,
		/<foreignObject\b/i,
		/href\s*=\s*["']?\s*javascript:/i
	];
	for (const pattern of unsafe)
		if (pattern.test(svg)) errors.push(`${where}: SVG contains ${pattern}`);
}

function checkHtml(file: string, html: string): void {
	const where = relative(outDir, file);
	const headEnd = html.search(/<\/head>/i);
	const csp = [...html.matchAll(/<meta\b[^>]*>/gi)].find((m) =>
		/http-equiv\s*=\s*["']?content-security-policy/i.test(m[0])
	);
	const policy = csp && attr(csp[0], 'content');
	if (!csp || !policy) {
		errors.push(`${where}: no CSP meta tag`);
		return;
	}
	if (headEnd !== -1 && csp.index > headEnd)
		errors.push(`${where}: CSP meta tag is outside <head>, browsers ignore it`);
	const firstLoader = html.search(/<(script|link|style)\b/i);
	if (firstLoader !== -1 && firstLoader < csp.index) {
		errors.push(`${where}: a script, link, or style precedes the CSP meta tag`);
	}
	for (const bad of ["'unsafe-inline'", "'unsafe-eval'"]) {
		if (policy.includes(bad)) errors.push(`${where}: CSP contains ${bad}`);
	}
	const directive = (name: string) =>
		policy.match(new RegExp(`(?:^|;)\\s*${name}\\s([^;]*)`, 'i'))?.[1] ?? '';
	const scriptSrc = directive('script-src');
	const styleSrc = directive('style-src');

	for (const [, attrs = '', body = ''] of html.matchAll(
		/<script\b([^>]*)>([\s\S]*?)<\/script>/gi
	)) {
		if (/(?:^|\s)src\s*=/i.test(attrs) || /\stype\s*=\s*["']?application\/(ld\+)?json/i.test(attrs))
			continue;
		if (!scriptSrc.includes(sha256(body))) {
			errors.push(
				`${where}: inline script without a matching CSP hash: ${body.trim().slice(0, 60)}`
			);
		}
	}
	for (const [, body = ''] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
		if (!styleSrc.includes(sha256(body)))
			errors.push(`${where}: inline <style> without a matching CSP hash`);
		checkCss(where, body);
	}
	for (const [tag] of html.matchAll(/<[a-z][^>]*\son[a-z]+\s*=[^>]*>/gi)) {
		errors.push(`${where}: inline event handler: ${tag.slice(0, 80)}`);
	}
	for (const [tag] of html.matchAll(/<[a-z][^>]*\sstyle\s*=[^>]*>/gi)) {
		errors.push(`${where}: style attribute blocked by style-src 'self': ${tag.slice(0, 80)}`);
	}

	let initialJs = 0;
	// Inlined <style> (SvelteKit inlineStyleThreshold) counts toward the CSS budget.
	let css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].reduce(
		(sum, [, body = '']) => sum + gzipSync(body).length,
		0
	);
	for (const [tag, name = ''] of html.matchAll(LOADING_TAGS)) {
		const rels = (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/).filter(Boolean);
		if (name.toLowerCase() === 'link' && !rels.some((r) => FETCHING_RELS.test(r))) continue;
		for (const url of urlsOf(tag)) {
			if (isRemote(url)) errors.push(`${where}: third-party resource: ${url}`);
			if (basePath && url.startsWith('/') && !url.startsWith(`${basePath}/`)) {
				errors.push(`${where}: root-absolute URL outside base path ${basePath}: ${url}`);
			}
			const local = localFile(file, url);
			if (!local) continue;
			try {
				// SvelteKit leaves disabled links to the stylesheets it inlined.
				if (rels.includes('stylesheet')) {
					if (!/\sdisabled(?=[\s>/=])/i.test(tag)) css += gzSize(local);
				} else if (rels.includes('modulepreload') || /^script$/i.test(name)) {
					initialJs += gzSize(local);
				}
			} catch (err) {
				if (!isMissing(err)) throw err;
				errors.push(`${where}: references missing file ${url}`);
			}
		}
	}
	if (initialJs > MAX_INITIAL_JS_GZ)
		errors.push(`${where}: initial JS ${kb(initialJs)} gzip, budget ${kb(MAX_INITIAL_JS_GZ)}`);
	if (css > MAX_CSS_GZ) errors.push(`${where}: CSS ${kb(css)} gzip, budget ${kb(MAX_CSS_GZ)}`);

	for (const [tag] of html.matchAll(/<a\b[^>]*target\s*=\s*["']?_blank[^>]*>/gi)) {
		if (!/noopener/i.test(attr(tag, 'rel') ?? ''))
			errors.push(`${where}: target=_blank without noopener: ${tag.slice(0, 80)}`);
	}
	if (/\shref\s*=\s*["']?http:\/\//i.test(html)) warnings.push(`${where}: plain http: link`);
}

let files: string[];
try {
	files = walk(outDir);
} catch (err) {
	if (isMissing(err)) {
		console.error(`check-dist: ${outDir}/ not found, run the build first`);
		process.exit(1);
	}
	throw err;
}

let pages = 0;
const fonts: number[] = [];
for (const file of files) {
	const where = relative(outDir, file);
	if (file.endsWith('.map')) warnings.push(`${where}: source map in output`);
	if (IMAGE_EXT.test(file) && statSync(file).size > MAX_IMAGE) {
		errors.push(`${where}: image ${kb(statSync(file).size)}, budget ${kb(MAX_IMAGE)}`);
	}
	if (FONT_EXT.test(file)) fonts.push(statSync(file).size);
	if (!TEXT_EXT.test(file)) continue;
	const text = readFileSync(file, 'utf8');
	for (const pattern of SECRET_PATTERNS) {
		if (pattern.test(text)) errors.push(`${where}: matches secret pattern ${pattern}`);
	}
	if (file.endsWith('.html')) {
		pages += 1;
		checkHtml(file, text);
	} else if (file.endsWith('.css')) checkCss(where, text);
	else if (file.endsWith('.svg')) checkSvg(where, text);
}

const fontTotal = fonts.reduce((sum, size) => sum + size, 0);
if (fonts.length > MAX_FONT_FILES)
	errors.push(`${fonts.length} font files, budget ${MAX_FONT_FILES}`);
if (fontTotal > MAX_FONTS_TOTAL)
	errors.push(`fonts ${kb(fontTotal)}, budget ${kb(MAX_FONTS_TOTAL)}`);
if (pages === 0) errors.push(`no HTML files in ${outDir}/, the build wrote nothing to check`);
else if (!files.includes(join(outDir, 'index.html'))) errors.push(`${outDir}/index.html missing`);

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
	`check-dist: ${pages} pages, ${files.length} files, ${errors.length} errors, ${warnings.length} warnings`
);
process.exit(errors.length ? 1 : 0);
