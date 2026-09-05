<script lang="ts">
  import gtfsRealtimeBindings from 'gtfs-realtime-bindings'
  import type { StopInfoResult, StopTimesResult } from '@lib/client'

  import { getTextColor } from '$lib/utils/color'
  import { formatTripHeadsign } from '$lib/utils/formatHeadsign'
  import { formatShortDate } from '$lib/utils/formatDate'

  import arrowRightSmallSvg from '../../icons/arrow-right-small.svg?raw'
  import realtimeSvg from '../../icons/realtime.svg?raw'

  const {
    stopInfo,
    stopTimes,
    tripUpdates,
  }: {
    stopInfo?: StopInfoResult
    stopTimes: StopTimesResult[]
    tripUpdates?: gtfsRealtimeBindings.transit_realtime.ITripUpdate[]
  } = $props()

  const filteredTimes = $derived(
    stopTimes
      .flatMap((i) => {
        if (!i.departureTime) return []

        const now = new Date()
        let departureTime = new Date(i.departureTime)

        let isRealtime = false
        const realtimeTrip = (tripUpdates || []).find((r) => r.trip.tripId === i.tripId)
        if (realtimeTrip) {
          isRealtime = true
          if (
            realtimeTrip.trip.scheduleRelationship ===
            gtfsRealtimeBindings.transit_realtime.TripDescriptor.ScheduleRelationship.CANCELED
          ) {
            return []
          }

          let arrivalDelay = realtimeTrip.delay || 0
          let departureDelay = realtimeTrip.delay || 0
          const stopTimeUpdate = (realtimeTrip.stopTimeUpdate || []).find((i) => i.stopSequence)
          if (stopTimeUpdate) {
            if (stopTimeUpdate.arrival?.delay) {
              arrivalDelay = stopTimeUpdate.arrival.delay
            }
            if (stopTimeUpdate.departure?.delay) {
              departureDelay = stopTimeUpdate.departure.delay
            }
          }
          departureTime = new Date(
            departureTime.getTime() + (departureDelay || arrivalDelay) * 1000
          )

          // if the departure time has passed, then the service has gone
          if (departureTime.getTime() < now.getTime()) return []
        } else {
          // if it's not realtime, there is a 3 minute grace period
          if (departureTime.getTime() < now.getTime() - 3 * 60 * 1000) return []
        }

        return [{ ...i, departureTime, isRealtime }]
      })
      // todo: need to put the same route short names next to each other
      .sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime())
  )
  const groupedTimes = $derived(Object.groupBy(filteredTimes, (i) => i.routeId + i.directionId))
</script>

<ul>
  {#if Object.keys(groupedTimes).length === 0}
    <li class="empty">No services found at this station today.</li>
  {/if}
  {#each Object.keys(groupedTimes) as routeId (routeId)}
    {@const route = groupedTimes[routeId] || []}
    {@const trip = route[0]}
    {@const departureTime = formatShortDate(trip.departureTime, trip.agencyTimezone, 'short')}
    <li>
      <a
        class={{ isRealtime: trip.isRealtime }}
        href="/{trip.prefix}/routes/{trip.routeId}?tripId={encodeURIComponent(
          trip.tripId
        )}&stopId={encodeURIComponent(trip.stopId)}"
        style={`${trip.routeColor ? `color: ${getTextColor(trip.routeColor)};` : ''}${trip.routeColor ? `background: #${trip.routeColor};` : ''}`}
      >
        <div class="direction">
          <h3>{trip.routeShortName}</h3>
          <div class="destination">
            <span class={{ 'direction-icon': true, 'direction-reverse': trip.directionId === 1 }}
              >{@html arrowRightSmallSvg}</span
            >
            <p class="headsign">
              <!-- todo: should probably be a nice format headsign function -->
              {#each formatTripHeadsign(trip.tripHeadsign) as headsignPart, index (index)}
                <span class="headsign-segment">
                  {headsignPart}&nbsp;
                </span>
              {/each}
            </p>
          </div>
          {#if stopInfo}
            {@const substop =
              stopInfo.childStops
                .find((i) => i.stopId === trip.stopId)
                ?.stopName?.replace(stopInfo.stopName || '', '')
                .trim() || ''}
            {#if substop !== ''}
              <p class="substop">
                {#if new Number(substop).toString() === substop}Platform&nbsp;{/if}{substop}
              </p>
            {/if}
          {/if}
        </div>
        <div class="time">
          <h4>
            {#if trip.isRealtime}
              <div class="realtime-icon">{@html realtimeSvg}</div>
            {/if}
            <time datetime={trip.departureTime.toISOString()}
              ><span>{(departureTime.match(/[0-9:]*/g) || [''])[0]}</span>{departureTime.replace(
                /[0-9:]*/g,
                ''
              )}
            </time>
          </h4>
          {#if route[1] && route[2]}
            {@const secondTime = formatShortDate(
              route[1].departureTime,
              trip.agencyTimezone,
              'long'
            )}
            {@const secondTimeShort = formatShortDate(route[1].departureTime, trip.agencyTimezone)}
            {@const thirdTime = formatShortDate(
              route[2].departureTime,
              trip.agencyTimezone,
              'long'
            )}
            {@const thirdTimeShort = formatShortDate(route[2].departureTime, trip.agencyTimezone)}
            <!-- todo: this is very messy -->
            <p>
              also {#if secondTime.includes('min')}in{:else}at{/if}
              {#if thirdTime.includes('min')}<time datetime={route[1].departureTime.toISOString()}
                  >{secondTimeShort}</time
                >,&nbsp;{:else}<time datetime={route[1].departureTime.toISOString()}
                  >{secondTimeShort}</time
                >{#if secondTime.includes('min')}&nbsp;mins{/if}&nbsp;&amp;&nbsp;{/if}<time
                datetime={route[2].departureTime.toISOString()}>{thirdTimeShort}</time
              >{#if thirdTime.includes('min')}&nbsp;mins{/if}
            </p>
          {:else if route[1]}
            {@const secondTime = formatShortDate(
              route[1].departureTime,
              trip.agencyTimezone,
              'long'
            )}
            <p>
              also {#if secondTime.includes('min')}in{:else}at{/if}
              <time datetime={route[1].departureTime.toISOString()}>{secondTime}</time>
            </p>
          {/if}
        </div>
      </a>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  li a {
    display: grid;
    grid-template-columns: minmax(100px, 1fr) auto;
    gap: 1.5rem;
    text-decoration: none;
    cursor: default;
    padding: calc(var(--edge-padding) - 0.25rem) var(--edge-padding);
    color: #fff;
    background: #4c4c4c;
    align-items: center;
    border-bottom: 1px solid var(--surface-border);
  }
  li a:active,
  li a:hover {
    opacity: 0.9;
  }
  li h3 {
    font-weight: 800;
    font-size: 1.5rem;
    margin: 0;
  }
  li p {
    margin: 0;
    font-size: 12px;
    text-wrap: pretty;
    letter-spacing: -0.1px;
    font-weight: 500;
  }
  li.empty {
    text-align: center;
    background: var(--surface-bg-subtle);
    padding: 1.5rem 1rem;
    color: var(--surface-text-subtle);
    font-size: 14px;
  }
  .destination {
    display: flex;
    align-items: top;
    gap: 0.25rem;
    vertical-align: top;
  }
  .direction-icon {
    display: block;
    color: inherit;
    height: 8px;
    padding: 3px 0;
  }
  .direction-reverse :global(svg) {
    transform: rotate(180deg);
  }
  .direction-icon :global(svg) {
    display: block;
  }
  .headsign {
    flex: 1;
  }
  .headsign-segment {
    display: inline-block;
  }
  .substop {
    margin-top: 0.375rem;
    display: inline-block;
    padding: 2px 4px;
    border: 0.5px solid #ffffff44;
    background: #ffffff18;
    border-radius: var(--base-border-radius);
    font-size: 11px;
  }
  .time {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .time h4 {
    font-size: 1rem;
    margin: 0;
    opacity: 0.7;
    position: relative;
  }
  @keyframes realtime-flicker {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.5;
    }
    75% {
      opacity: 0.9;
    }
    100% {
      opacity: 0.5;
    }
  }
  .realtime-icon {
    position: absolute;
    top: -2px;
    right: -9px;
    animation: realtime-flicker 2000ms infinite ease;
  }
  .realtime-icon :global(svg) {
    color: inherit;
  }
  .isRealtime .time h4 {
    opacity: 1;
  }
  .time h4 span {
    font-size: 1.25rem;
    letter-spacing: -0.25px;
  }
  .time p {
    font-size: 13px;
  }
  .time time {
    font-weight: bold;
  }
</style>
