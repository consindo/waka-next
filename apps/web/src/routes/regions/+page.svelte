<script lang="ts">
  import { resolve } from '$app/paths'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import type { PageData } from './$types'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
  const { regions } = $derived(data)
</script>

<Header title="Regions" />
<ScrollContainer>
  <div>
    <p>waka currently loads any regions offline that are in your current location</p>
    <ul>
      {#each regions as region (region.region)}
        {#each region.cities as city (city.id)}
          <li>
            <a href={resolve(`/?city=${city.id}`)}>
              <h2>{city.title}</h2>
              {#if city.subtitle}
                <h3>{city.subtitle}</h3>
              {/if}
            </a>
          </li>
        {/each}
      {/each}
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 1rem;
  }
</style>
