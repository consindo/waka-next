<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import type { PageData } from './$types'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
  const { regions } = data
</script>

<Header title="Regions" />
<ScrollContainer>
  <div>
    <p>waka currently loads any regions offline that are in your current location</p>
    <ul>
      {#each regions as region (region.region)}
        <li>
          {region.region}
          <ul>
            <li><a href="/{region.region}/stops">stops</a></li>
            <li><a href="/{region.region}/routes">routes</a></li>
          </ul>
        </li>
      {/each}
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 1rem;
  }
</style>
