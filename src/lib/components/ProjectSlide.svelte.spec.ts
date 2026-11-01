import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Project } from '#lib/content/schema.ts';
import ProjectSlide from './ProjectSlide.svelte';

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

describe('ProjectSlide', () => {
	it('renders a project with only required fields', async () => {
		render(ProjectSlide, { project: minimal });
		await expect.element(page.getByRole('heading', { name: 'Draft project' })).toBeVisible();
		await expect.element(page.getByText('In progress')).toBeVisible();
		await expect.element(page.getByText(/Results are not in yet/)).toBeVisible();
		expect(page.getByRole('img').elements()).toHaveLength(0);
		expect(page.getByRole('button').elements()).toHaveLength(0);
	});

	it('steps through its figures and wraps', async () => {
		// Set by +layout.svelte on mount; the figure buttons stay hidden until then.
		document.documentElement.dataset.hydrated = '';
		render(ProjectSlide, {
			project: {
				...minimal,
				visual: { type: 'steps', title: 'How it runs', steps: [{ title: 'Load' }] },
				gallery: [{ src: 'pv-bess/architecture', alt: 'Block diagram of the pipeline.' }]
			}
		});
		const count = page.getByText(/^Figure \d of 2$/);
		await expect.element(count).toHaveTextContent('Figure 1 of 2');
		await page.getByRole('button', { name: 'Next figure' }).click();
		await expect.element(count).toHaveTextContent('Figure 2 of 2');
		await page.getByRole('button', { name: 'Next figure' }).click();
		await expect.element(count).toHaveTextContent('Figure 1 of 2');
		await page.getByRole('button', { name: 'Previous figure' }).click();
		await expect.element(count).toHaveTextContent('Figure 2 of 2');
	});
});
