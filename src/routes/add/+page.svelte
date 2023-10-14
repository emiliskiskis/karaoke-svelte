<script lang="ts">
</script>

<form method="POST">
	<div>
		<label for="title">
			Title
			<input name="title" />
		</label>
	</div>
	<div>
		<label for="videoId">
			Video ID
			<input name="videoId" />
		</label>
	</div>
	<div>
		<label>
			Song lyrics
			<textarea name="text" />
		</label>
	</div>
	<button>Submit</button>
</form>

<style>
	label {
		font-weight: bold;
	}
	div {
		margin-bottom: 1rem;
	}
</style>
