<script lang="ts">
  import { page } from '$app/stores'
  export let data
</script>

<div>
  <a href="/">home</a>
  <h2>gtfs query results - stops {$page.params.prefix}</h2>
  <pre>{JSON.stringify(data, undefined, 2)}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
