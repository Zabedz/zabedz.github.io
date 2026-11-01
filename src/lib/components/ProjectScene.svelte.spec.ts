import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Project } from '#lib/content/schema.ts';
import ProjectScene from './ProjectScene.svelte';

const minimal: Project = {
	slug: 'draft',
	repo: 'Zabedz/draft',
	title: 'Draft project',
	pitch: 'A project with only the required fields.',
	summary: 'Nothing optional is filled in yet.',
	status: 'active',
	statusNote: 'Results are not in yet.',
	stack: ['TypeScript'],
	highlights: ['First claim.', 'Second claim.']
};

describe('ProjectScene', () => {
	it('renders a project with only required fields', async () => {
		render(ProjectScene, { project: minimal });
		await expect.element(page.getByRole('heading', { name: 'Draft project' })).toBeVisible();
		await expect.element(page.getByText('In progress')).toBeVisible();
		await expect.element(page.getByText(/Results are not in yet/)).toBeVisible();
		expect(page.getByRole('img').elements()).toHaveLength(0);
	});

	it('names the collaboration and the owner part', async () => {
		render(ProjectScene, {
			project: { ...minimal, repo: 'someone/else', role: 'Wrote the parser.', status: 'complete' }
		});
		await expect.element(page.getByText('Team project in someone/else')).toBeVisible();
		await expect.element(page.getByText(/Wrote the parser/)).toBeVisible();
		await expect.element(page.getByText(/Results are not in yet/)).not.toBeInTheDocument();
	});
});
