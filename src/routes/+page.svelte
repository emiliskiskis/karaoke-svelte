<script lang="ts">
	export let data;
</script>

{#each data.songs as song}
	<div>
		<a href={song.videoId}>{song.title}</a>
	</div>
{/each}
