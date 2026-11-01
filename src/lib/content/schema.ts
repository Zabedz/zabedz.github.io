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
	/** 'percent' values are already percentages: 5 means 5%. */
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

/** The main thing a project scene shows. */
export type Visual =
	| { type: 'image'; image: ImageRef }
	| { type: 'chart'; chart: Chart }
	| { type: 'steps'; title: string; steps: Step[] };

export interface Project {
	/** Kebab case; equals the file name and the image folder. */
	slug: string;
	/** `owner/name`. An owner other than the site owner marks a collaboration. */
	repo: string;
	title: string;
	/** One sentence. */
	pitch: string;
	/** Two or three sentences. */
	summary: string;
	status: Status;
	/** What is missing or still running. */
	statusNote?: string;
	/** Collaborations: what the site owner built. */
	role?: string;
	/** Collaborations: who the project was for or with. */
	team?: string;
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

export interface ChapterEntry {
	slug: string;
	/** Gets a pinned scroll scene; others render as compact rows. */
	featured?: boolean;
}

export interface Chapter {
	/** Section id and nav target. */
	id: string;
	/** Nav text. */
	label: string;
	title: string;
	intro: string;
	projects: ChapterEntry[];
}

export interface Site {
	name: string;
	/** Hero line under the name. */
	headline: string;
	about: string[];
	links: Link[];
	/** GitHub user that owns the site; repos under another owner are collaborations. */
	owner: string;
	url: string;
	description: string;
}
