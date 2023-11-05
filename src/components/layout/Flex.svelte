<script lang="ts">
	import type * as CSS from 'csstype';

	export let sx: CSS.Properties = {};
</script>

<div
	style={Object.entries(sx)
		.map((entry) => entry.join(':'))
		.join(';')}
>
	<slot />
</div>

<style>
	div {
		display: flex;
	}
</style>
