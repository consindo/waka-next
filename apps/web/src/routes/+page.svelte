<script lang="ts">
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import { type PageData } from './$types'
  import { currentRegions } from './mapstate.svelte'

  import routeSvg from '../icons/route.svg?url'
  import citySvg from '../icons/city.svg?url'
  import consoleSvg from '../icons/console.svg?url'
  import starSvg from '../icons/star.svg?url'

  const { data }: { data: PageData } = $props()
  const { regions } = $derived(data)

  const images = import.meta.glob('@regions/images/*.avif', { eager: true })

  const searchParams = new URL(page.url).searchParams
  const cityParam = searchParams.get('city')
  const cityRegion = $derived(regions.find((i) => i.cities.find((j) => j.id === cityParam)))

  const selectedRegionIds = $derived(cityRegion ? [cityRegion.region] : currentRegions.ids)
  const selectedRegionsUrl = $derived(selectedRegionIds.join(','))

  // todo: we probably need some sort of currentCities if you're moving the map around - at the moment, it'll just show the first city unless you have js disabled
  const primaryRegion = $derived(regions.find((r) => r.region === selectedRegionIds[0]))
  const primaryCity = $derived(
    primaryRegion?.cities.find((i) => i.id === cityParam) || primaryRegion?.cities[0]
  )

  const cityImage = $derived(
    Object.keys(images).find((i) => i.endsWith((primaryRegion?.region || 'nz-akl') + '.avif'))
  )
  const cityImageUrl = $derived(images[cityImage].default)
</script>

<Header title="Waka" subtitle={primaryCity?.title} isCloseButtonEnabled={false} />
<ScrollContainer>
  <div class="wrapper">
    <div class="intro-text">
      <h3>Kia ora, welcome to Waka!</h3>
      <p>Waka is your realtime guide to public transport in Aotearoa New Zealand</p>
    </div>
    <nav>
      <div class="block-link-wrapper">
        {#if selectedRegionsUrl !== ''}
          <a class="block-link" href={resolve('/[region]/routes', { region: selectedRegionsUrl })}>
            <img class="img-invert icon" src={routeSvg} alt="" />
            <h4>Routes</h4>
          </a>
        {/if}
        <a class="block-link" href={resolve('/cities')} style={`--bg: url(${cityImageUrl})`}>
          <img class="img-invert icon" src={citySvg} alt="" />
          <h4>Cities</h4>
        </a>
      </div>

      <a class="wide-link" href={resolve('/changelog')}>
        <img class="img-invert icon" src={starSvg} alt="" />
        <div>
          <h4>What’s new?</h4>
          <p>Find out what’s new in Waka</p>
        </div>
      </a>
      <a class="wide-link" href={resolve('/dev/orchestrator')}>
        <img class="img-invert icon" src={consoleSvg} alt="" />
        <div>
          <h4>Developer console</h4>
          <p>Run SQL against transit data</p>
        </div>
      </a>
    </nav>
  </div>
</ScrollContainer>

<style>
  .wrapper {
    padding: var(--edge-padding);
  }
  a {
    color: var(--surface-text);
    text-decoration: none;
    cursor: default;
    user-select: none;
  }
  .intro-text {
    padding: 0.5rem 0 1rem;
  }
  h3 {
    padding: 0 0 0.5rem;
    font-weight: 600;
  }
  h3,
  h4,
  p {
    margin: 0;
  }
  .block-link-wrapper {
    display: flex;
    gap: 0.25rem;
  }
  .block-link,
  .wide-link {
    border-radius: calc(var(--base-border-radius) - 1px);
    box-shadow: var(--surface-shadow);
  }
  .block-link {
    flex: 1;
    gap: 0.25rem;
    aspect-ratio: 1.618;
    box-sizing: border-box;
    box-shadow:
      0 0 0 1px #00000022 inset,
      var(--surface-shadow);
    background-color: #222;
    color: #fff;
    margin-bottom: 0.5rem;
    transition: 100ms ease transform;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
    background-size: cover;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-image: linear-gradient(#00000000 30%, #000000aa 100%), var(--bg);
    font-size: 14px;
    font-weight: 600;

    &:hover {
      opacity: 0.8;
    }
    &:active {
      transform: scale(0.97);
    }

    .icon {
      width: 16px;
      height: 16px;
      opacity: 0.85;
    }
  }
  .wide-link {
    border: 0.5px solid var(--surface-border);
    display: block;
    padding: 0.5rem;
    gap: 0.5rem;
    background: var(--surface-bg);
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;

    &:last-child {
      margin-bottom: 0;
    }
    &:hover {
      background: var(--surface-bg-subtle);
    }
    &:active {
      background: var(--surface-bg-subtle-hover);
    }

    div {
      flex: 1;
    }

    .icon {
      width: 20px;
      height: 20px;
      margin: 0 2px;
      opacity: 0.9;
    }
  }

  p {
    font-size: 14px;
    color: var(--surface-text-subtle);
  }
</style>
