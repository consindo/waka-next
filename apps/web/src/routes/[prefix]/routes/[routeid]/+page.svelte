<script lang="ts">
  import { page } from '$app/state'

  import Header from '$lib/components/Header.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const tripId = $derived(searchParams.get('tripId'))

  const currentService = $derived((data.services || []).find((i) => i.tripId === tripId))
  const initialStopIndex = 0
  const initialTime = $derived(
    new Date(`${currentService?.date} ${data.timetable[initialStopIndex].departureTime}`)
  )

  const getMinuteDifference = (initialTime: Date, departureTime: Date) => {
    const mins = Math.floor((departureTime.getTime() - initialTime.getTime()) / 1000 / 60)
    if (mins === 1) {
      return '+1 min'
    } else if (mins >= 0) {
      return `+${mins} mins`
    } else {
      return `-${mins} mins`
    }
  }
</script>

{#if data.route}
  <Header
    title={data.route.routeShortName}
    subtitle={data.route.routeLongName ||
      (data.services || []).find((i) => i.directionId === 0)?.tripHeadsign}
  />
  <div class="content">
    <div>
      <details>
        <summary>
          <h2>Services</h2>
        </summary>
        <ul>
          {#if data.services && data.services.length > 0}
            {#each data.services as service, i (i)}
              <li>
                <a
                  data-sveltekit-replacestate
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
      </details>
    </div>
    <div>
      <ul class="stop-times-wrapper">
        {#each data.timetable as time, i (i)}
          {@const departureTime = new Date(`${currentService?.date || ''} ${time.departureTime}`)}
          {@const transfersWithoutSelf = time.transfers.filter(
            (i) => i.routeShortName !== data.route?.routeShortName
          )}
          <li class="stop-time">
            <a href="/{time.prefix}/stops/{time.parentStopId || time.stopId}">
              <div>
                <h4>{time.parentStopName || time.stopName}</h4>
                {#if transfersWithoutSelf.length > 0}
                  <ul>
                    {#each transfersWithoutSelf as route (route.routeShortName)}
                      <li>{route.routeShortName}</li>
                    {/each}
                  </ul>
                {/if}
              </div>
              <time
                ><strong>{getMinuteDifference(initialTime, departureTime)}</strong>
                {departureTime.toLocaleString(undefined, {
                  hour12: false,
                  hour: 'numeric',
                  minute: 'numeric',
                })}</time
              >
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{:else}
  <Header title="Not found" />
{/if}

<style>
  a {
    text-decoration: none;
  }
  .content {
    padding: 0.75rem;
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
  .stop-times-wrapper {
    padding: 0;
    margin: 0;
  }
  .stop-time {
    display: block;
    border-left: 4px solid #444;
    padding-left: 0.5rem;
    margin-left: 0.5rem;
    position: relative;
  }
  .stop-time:first-child::after,
  .stop-time:last-child::after {
    content: '';
    position: absolute;
    height: 50%;
    width: 4px;
    background: var(--surface-bg-subtle);
    left: -4px;
    top: 0;
  }
  .stop-time:last-child::after {
    top: calc(50%);
  }
  .stop-time::before {
    --circle-size: 14px;
    z-index: 1;
    content: '';
    display: block;
    width: var(--circle-size);
    height: var(--circle-size);
    border: 2px solid #444;
    box-sizing: border-box;
    border-radius: var(--circle-size);
    position: absolute;
    left: calc(var(--circle-size) / -2 - 2px);
    top: calc(50% - var(--circle-size) / 2);
    background: #fff;
  }
  .stop-time a {
    display: flex;
    gap: 1rem;
    padding: 0.375rem;
    border-bottom: 0.5px solid var(--surface-border);
    align-items: center;
  }
  .stop-time:last-child a {
    border-bottom: 0;
  }
  .stop-time div {
    flex: 1;
    color: var(--surface-text);
    align-content: center;
  }
  .stop-time h4 {
    font-weight: 600;
    margin: 0;
    font-size: 14px;
  }
  .stop-time div ul {
    margin: 0;
    padding: 0;
  }
  .stop-time div ul li {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    background: var(--surface-bg);
    padding: 1px 4px;
    border-radius: 3px;
    margin-right: 2px;
  }
  .stop-time time {
    color: var(--surface-text-subtle);
    text-align: right;
    font-size: 13px;
  }
  .stop-time time strong {
    display: block;
  }
</style>
