<script lang="ts">
  export let data
</script>

<div>
  <a href="/">home</a>
  <h2>gtfs query results - routes</h2>
  <pre>{JSON.stringify(data, undefined, 2)}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
