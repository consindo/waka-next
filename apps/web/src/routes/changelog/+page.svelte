<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import { type PageData } from './$types'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
  const { version } = $derived(data)
</script>

<Header title="Changelog" subtitle={`v${version}`} />
<ScrollContainer>
  <div>
    <h3>v4.0</h3>
    <time datetime="2026-09-12">September 12, 2026</time>
    <p>
      Waka v4 is a full rebuild of Waka with a new design, and aims to support many more cities in
      the future!
    </p>
    <p>There's a few features missing from v3, but these will be added back in the near future.</p>
    <h5>New</h5>
    <ul>
      <li>New overall app design, with much improved accessibility and dark mode.</li>
      <li>Much faster page loads, and improved app performance.</li>
      <li>New developer tools that allow you to run SQL against transit data in the browser.</li>
      <li>Realtime service alerts from transit agencies are visible in app.</li>
      <li>Large stations show as a single station, rather than many individual stations.</li>
    </ul>
    <h5>Regional Changes</h5>
    <ul>
      <li>Auckland now has new map icons, and new route categories.</li>
    </ul>
    <h5>Removed</h5>
    <ul>
      <li>The timetable currently only shows information one day in advance.</li>
      <li>Saved stations have been temporarily removed.</li>
    </ul>
    <h3>v4.0 Patch Releases</h3>
    <h4>v4.0.5</h4>
    <time datetime="2026-09-20">September 20, 2026</time>
    <h5>Bug Fixes</h5>
    <ul>
      <li>Fixed inaccurate realtime times on station page.</li>
      <li>Developer: Switched to native node.js sqlite for queries performed on server.</li>
    </ul>
    <h4>v4.0.4</h4>
    <time datetime="2026-09-19">September 19, 2026</time>
    <h5>Bug Fixes</h5>
    <ul>
      <li>Fixed inaccurate times on timetable page.</li>
      <li>Added back indicator for the last service of the day.</li>
      <li>Correctly displays school bus stops as bus stops.</li>
      <li>Developer: Sample GTFS data now works properly.</li>
    </ul>
    <h4>v4.0.3</h4>
    <time datetime="2026-09-17">September 17, 2026</time>
    <h5>Bug Fixes</h5>
    <ul>
      <li>Added geolocate button back to map.</li>
      <li>Prevents map recentering to stop on data refresh.</li>
    </ul>
    <h4>v4.0.2</h4>
    <time datetime="2026-09-16">September 16, 2026</time>
    <h5>Bug Fixes</h5>
    <ul>
      <li>Routes that visit the same station twice on a trip are handled properly.</li>
      <li>Stop headsigns are now prioritized over trip headsigns.</li>
      <li>An error page has been added.</li>
    </ul>
    <h5>Regional Changes</h5>
    <ul>
      <li>Franklin route group has been added for Auckland.</li>
    </ul>
    <h4>v4.0.1</h4>
    <time datetime="2026-09-14">September 14, 2026</time>
    <h5>New</h5>
    <ul>
      <li>An Install App button has been added for Chromium based browsers.</li>
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 0 var(--edge-padding) 0.5rem;
    line-height: 1.35;
    font-size: 15px;
    text-wrap: pretty;
  }
  time {
    color: var(--surface-text-subtle);
    font-size: 13px;
  }
  ul {
    margin: 0.75em 0;
    padding-left: 2em;
  }
  li {
    margin-bottom: 0.25em;
  }
  h3,
  h4,
  h5 {
    margin-bottom: 0;
  }
  h5 {
    margin-top: 1em;
    font-size: 1em;
  }
</style>
