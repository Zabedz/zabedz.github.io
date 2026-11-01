/** Types for everything under src/lib/content. */

/** Shown as a badge; anything but 'complete' also shows `statusNote`. */
export type Status = 'complete' | 'active' | 'paused' | 'prototype';

export interface ImageRef {
	/** `<slug>/<name>`: source `assets/projects/<slug>/<name>.<ext>`, output under `static/projects/`. */
	src: string;
	/** Same format as `src`; used under `prefers-color-scheme: dark`. */
	dark?: string;
	alt: string;
	caption?: string;
}

export interface Link {
	label: string;
	/** Absolute `https:` URL. */
	href: string;
}

export interface Stat {
	value: string;
	label: string;
}

export interface Step {
	title: string;
	detail?: string;
}

export interface Series {
	label: string;
	values: number[];
}

/** Grouped bars on one axis: one or two series, each with one value per category. */
export interface BarChart {
	kind: 'bars';
	title: string;
	categories: string[];
	/** Header for the category column of the data table. */
	categoryLabel?: string;
	series: [Series] | [Series, Series];
	/** 'percent' values are signed changes in percent: 5 renders as +5%. */
	format: 'decimal' | 'percent';
	note?: string;
}

/** Small multiples over a shared x axis: one panel per series, each with its own y scale. */
export interface LineChart {
	kind: 'lines';
	title: string;
	/** One label per point; at least two. */
	x: string[];
	/** Header for the x column of the data table. */
	xLabel?: string;
	panels: (Series & { unit?: string })[];
	note?: string;
}

export interface ScatterChart {
	kind: 'scatter';
	title: string;
	xLabel: string;
	yLabel: string;
	points: [number, number][];
	/** Vertical reference line, e.g. a threshold. */
	threshold?: { x: number; label: string };
	note?: string;
}

export type Chart = BarChart | LineChart | ScatterChart;

/** The first figure on a project slide; `gallery` images follow it. */
export type Visual =
	| { type: 'image'; image: ImageRef }
	| { type: 'chart'; chart: Chart }
	| { type: 'steps'; title: string; steps: Step[] };

export interface Project {
	/** Kebab case; equals the file name and the image folder. */
	slug: string;
	/** `owner/name`. */
	repo: string;
	title: string;
	/** Short name for the project index; defaults to `title`. */
	label?: string;
	/** One sentence. */
	pitch: string;
	/** Two or three sentences. */
	summary: string;
	/** Phrases in `summary` that link out; each `label` appears in it verbatim. */
	summaryLinks?: Link[];
	status: Status;
	/** What is missing or still running. */
	statusNote?: string;
	/** Prior work the project started from. */
	credit?: string;
	stack: string[];
	/** Two to four claims, each checkable in the repo. */
	highlights: string[];
	/** At most four. */
	stats?: Stat[];
	visual?: Visual;
	gallery?: ImageRef[];
	links?: Link[];
}

export interface Site {
	name: string;
	/** Hero line under the name. */
	headline: string;
	about: string[];
	links: Link[];
	/** GitHub user that owns the site. */
	owner: string;
	url: string;
	description: string;
}
