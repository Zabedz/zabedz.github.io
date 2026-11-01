import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// TypeScript checks undefined names; see typescript-eslint's FAQ on no-undef.
			'no-undef': 'off',
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			'no-restricted-properties': [
				'error',
				{ property: 'innerHTML', message: 'Render text; HTML sinks are blocked by the CSP.' },
				{ property: 'outerHTML', message: 'Render text; HTML sinks are blocked by the CSP.' },
				{ property: 'insertAdjacentHTML', message: 'Render text.' },
				{ object: 'document', property: 'write', message: 'Render text.' }
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		},
		rules: {
			'svelte/no-at-html-tags': 'error',
			'svelte/button-has-type': 'error'
		}
	},
	{
		files: ['tests/e2e/**'],
		ignores: ['tests/e2e/fixtures.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@playwright/test',
							message: "Import from './fixtures' so CSP violations fail the test."
						}
					]
				}
			]
		}
	}
);
