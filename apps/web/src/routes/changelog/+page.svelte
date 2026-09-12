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
    <h3>v4.0.0</h3>
    <time datetime="2026-09-12">September 12, 2026</time>
    <p>
      Waka v4 is a full rebuild of Waka with a new design, and aims to support many more cities in
      the future!
    </p>
    <p>There's a few features missing from v3, but these will be added back in the near future.</p>
    <h4>New</h4>
    <ul>
      <li>New overall app design, with much improved accessibility and dark mode.</li>
      <li>Much faster page loads, and improved app performance.</li>
      <li>New developer tools that allow you to run SQL against transit data in the browser.</li>
      <li>Realtime service alerts from transit agencies are visible in app.</li>
      <li>Large stations show as a single station, rather than many individual stations.</li>
    </ul>
    <h4>Regional Changes</h4>
    <ul>
      <li>Auckland now has new map icons, and new route categories.</li>
    </ul>
    <h4>Removed</h4>
    <ul>
      <li>The timetable currently only shows information one day in advance.</li>
      <li>Saved stations have been temporarily removed.</li>
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
    margin: 0.75em 0 1em;
    padding-left: 2em;
  }
  li {
    margin-bottom: 0.25em;
  }
  h3,
  h4 {
    margin-bottom: 0;
  }
</style>
