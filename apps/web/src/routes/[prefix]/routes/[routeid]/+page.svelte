<script lang="ts">
  import { page } from '$app/state'

  import Header from '$lib/components/Header.svelte'
  import Services from '$lib/components/Services.svelte'
  import Timetable from '$lib/components/Timetable.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const tripId = $derived(searchParams.get('tripId'))
  const stopId = $derived(searchParams.get('stopId'))

  const currentService = $derived((data.services || []).find((i) => i.tripId === tripId))
</script>

{#if data.route}
  <Header
    title={data.route.routeShortName}
    subtitle={data.route.routeLongName ||
      (data.services || []).find((i) => i.directionId === 0)?.tripHeadsign}
  />
  <div class="content">
    <div>
      {#if data.services && data.services.length > 0}
        <Services services={data.services} selectedService={searchParams.get('tripId')} />
      {/if}
    </div>
    <div>
      {#if currentService}
        <Timetable timetable={data.timetable} route={data.route} {currentService} {stopId} />
      {/if}
    </div>
  </div>
{:else}
  <Header title="Not found" />
{/if}
