<script lang="ts">
	import Flex from '@/components/layout/Flex.svelte';

	export let data;
</script>

{#each data.songs as song}
	<Flex sx={{ gap: '8px' }}>
		<a href={song.videoId}>{song.title}</a>
		<button>Delete</button>
	</Flex>
{/each}

<style>
</style>
