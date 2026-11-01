<script lang="ts">
	let { label, headers, rows }: { label: string; headers: string[]; rows: string[][] } = $props();
</script>

<details class="data">
	<summary>Show the data<span class="visually-hidden">: {label}</span></summary>
	<!-- A scrolling region must take focus so keyboard users can scroll it (axe scrollable-region-focusable). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="scroll" tabindex="0" role="region" aria-label={label}>
		<table>
			<thead>
				<tr>
					{#each headers as header, i (i)}<th scope="col">{header}</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row, r (r)}
					<tr>
						{#each row as cell, c (c)}
							{#if c === 0}<th scope="row">{cell}</th>{:else}<td>{cell}</td>{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</details>

<style>
	.data {
		font-size: var(--step--1);
	}

	summary {
		cursor: pointer;
		color: var(--accent);
		min-block-size: 2.75rem;
		display: flex;
		align-items: center;
	}

	.scroll {
		max-block-size: 20rem;
		overflow: auto;
	}

	table {
		border-collapse: collapse;
		inline-size: 100%;
	}

	th,
	td {
		padding: 0.25rem 0.75rem 0.25rem 0;
		text-align: end;
		border-block-end: 1px solid var(--rule);
		white-space: nowrap;
	}

	th:first-child {
		text-align: start;
	}
</style>
