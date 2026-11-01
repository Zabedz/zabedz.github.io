/**
 * Encode assets/projects/<slug>/<name>.(png|jpg|jpeg) into static/projects/<slug>/<name>-<w>.avif
 * and write the size manifest the site reads. Needs ffmpeg, ffprobe and avifenc on PATH.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

const SRC = 'assets/projects';
const OUT = 'static/projects';
const MANIFEST = 'src/lib/content/generated/images.json';
// Names go into srcset unescaped, and CI runs on a case-sensitive file system.
const NAME = /^[a-z0-9-]+$/;
const WIDTHS = [480, 800, 1600];
const MAX_BYTES = 150 * 1024;
const QUALITIES = [60, 50, 40, 30];
const INPUT = new Set(['.png', '.jpg', '.jpeg']);

interface Entry {
	width: number;
	height: number;
	widths: number[];
}

function run(cmd: string, args: string[]): string {
	return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function dimensions(file: string): [number, number] {
	const out = run('ffprobe', [
		'-v',
		'error',
		'-select_streams',
		'v:0',
		'-show_entries',
		'stream=width,height',
		'-of',
		'csv=p=0',
		file
	]);
	const [w, h] = out.trim().split(',').map(Number);
	if (!w || !h) throw new Error(`ffprobe gave no size for ${file}: ${out}`);
	return [w, h];
}

function isFresh(out: string, src: string): boolean {
	try {
		return statSync(out).mtimeMs >= statSync(src).mtimeMs;
	} catch {
		return false;
	}
}

function encode(src: string, out: string, width: number, tmp: string): void {
	const scaled = join(tmp, 'scaled.png');
	run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', `scale=${width}:-2:flags=lanczos`, scaled]);
	for (const q of QUALITIES) {
		run('avifenc', ['-q', String(q), '-s', '6', '-j', 'all', scaled, out]);
		if (statSync(out).size <= MAX_BYTES) return;
	}
	throw new Error(
		`${out} is over ${MAX_BYTES} bytes at q=${QUALITIES.at(-1)}; crop or shrink the source`
	);
}

const manifest: Record<string, Entry> = {};
const keep = new Set<string>();
const tmp = mkdtempSync(join(tmpdir(), 'portfolio-images-'));

try {
	for (const slug of readdirSync(SRC).sort()) {
		const dir = join(SRC, slug);
		if (!statSync(dir).isDirectory()) continue;
		mkdirSync(join(OUT, slug), { recursive: true });

		for (const file of readdirSync(dir).sort()) {
			if (!INPUT.has(extname(file).toLowerCase())) continue;
			const src = join(dir, file);
			const name = basename(file, extname(file));
			if (!NAME.test(name) || extname(file) !== extname(file).toLowerCase()) {
				throw new Error(`${src}: rename to lowercase letters, digits and dashes`);
			}
			const [width, height] = dimensions(src);
			const widths = WIDTHS.filter((w) => w <= width);
			if (widths.length === 0) widths.push(width);

			for (const w of widths) {
				const out = join(OUT, slug, `${name}-${w}.avif`);
				keep.add(out);
				if (isFresh(out, src)) continue;
				encode(src, out, w, tmp);
				console.log(`${out} ${Math.round(statSync(out).size / 1024)} kB`);
			}
			const top = widths.at(-1) ?? width;
			manifest[`${slug}/${name}`] = {
				width: top,
				height: Math.round((height * top) / width),
				widths
			};
		}
	}

	for (const slug of readdirSync(OUT)) {
		const dir = join(OUT, slug);
		if (!statSync(dir).isDirectory()) continue;
		for (const file of readdirSync(dir)) {
			const out = join(dir, file);
			if (file.endsWith('.avif') && !keep.has(out)) {
				rmSync(out);
				console.log(`removed stale ${out}`);
			}
		}
	}
} finally {
	rmSync(tmp, { recursive: true, force: true });
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log(`${Object.keys(manifest).length} images in ${MANIFEST}`);
