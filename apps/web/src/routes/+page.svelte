<script lang="ts">
  export let data
</script>

<div>
  <h1>waka:next</h1>
  <p>this will eventually be the new waka. however it's long way from being done.</p>
  <ul>
    <li><a href="/dev/query">developer console</a></li>
    <li><a href="https://github.com/consindo/waka-next">github</a></li>
    <li><a href="/sample">another gtfs route</a></li>
  </ul>
  <p>
    this page will prerender and return data via HTTP, and then start downloading the sqlite
    database in the background for subsequent requests (navigate to another page and then back here,
    and notice how the provider changes).
  </p>
  <p></p>
  <h2>gtfs query results - stops</h2>
  <pre>{JSON.stringify(data, undefined, 2)}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
