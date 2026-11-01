import { test as base, expect } from '@playwright/test';

interface Violation {
	directive: string;
	blocked: string;
	sample: string;
}

declare global {
	interface Window {
		__cspViolations: Violation[];
	}
}

/** `page` that fails the test on any CSP violation, page error, or console error. */
export const test = base.extend({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(`console: ${message.text()}`);
		});
		await page.addInitScript(() => {
			window.__cspViolations = [];
			document.addEventListener('securitypolicyviolation', (event) => {
				window.__cspViolations.push({
					directive: event.violatedDirective,
					blocked: event.blockedURI,
					sample: event.sample
				});
			});
		});

		await use(page);

		// A stale server or one without the policy would otherwise pass every check.
		if (!page.isClosed() && page.url().startsWith('http')) {
			await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
		}

		const violations = page.isClosed()
			? []
			: await page.evaluate(() => window.__cspViolations ?? []);
		expect(violations, 'CSP violations').toEqual([]);
		expect(errors, 'page errors').toEqual([]);
	}
});

export { expect };
