<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
</script>

<div class="page">
  {#if data.route}
    <Header title={page.params.routeid} />
    <pre>
  {JSON.stringify(data.route, null, 2)}
</pre>
    <div class="content">
      <div>
        <h2>Services</h2>
        <ul>
          {#if data.services && data.services.length > 0}
            {#each data.services as service, i (i)}
              <li>
                <a
                  class:selected={service.tripId === searchParams.get('tripId')}
                  href="{page.url.pathname}?tripId={service.tripId}"
                >
                  <code>{service.date}</code>
                  <strong>{service.departureTime}</strong>
                  {service.directionId === 1 ? '→' : '←'}
                  {service.tripHeadsign}
                </a>
              </li>
            {/each}
          {/if}
        </ul>
      </div>
      <div>
        <h2>Stop Times</h2>
        <ul>
          {#each data.timetable as time, i (i)}
            <li>
              <a href="/{time.prefix}/stops/{time.parentStopId || time.stopId}">
                {time.departureTime}
                {time.parentStopName || time.stopName}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {:else}
    <Header title="Not found" />
  {/if}
</div>

<style>
  .page {
    padding: 1rem;
  }
  a {
    text-decoration: none;
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
  .content {
    display: flex;
  }
</style>
