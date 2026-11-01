import metadata from './generated/github.json';

export interface RepoMeta {
	pushedAt: string;
	archived: boolean;
}

// Written by `pnpm fetch:projects`; a repo is missing until it has run for it.
const repos: Record<string, RepoMeta> = metadata;

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

export function lastUpdated(repo: string): string | undefined {
	const meta = repos[repo];
	return meta ? monthYear.format(new Date(meta.pushedAt)) : undefined;
}

export function isArchived(repo: string): boolean {
	return repos[repo]?.archived ?? false;
}
