<script lang="ts">
  import type { transit_realtime } from 'gtfs-realtime-bindings'
  import { variables } from '$lib/variables'

  import alertSvg from '../../icons/alert.svg'
  import chevronRightSvg from '../../icons/chevron-right.svg'

  const { language } = variables

  const {
    compact = false,
    serviceAlerts,
  }: { compact?: boolean; serviceAlerts: transit_realtime.IAlert[] } = $props()
</script>

<details class={{ 'main-details': true, compact, single: serviceAlerts.length === 1 }}>
  <summary>
    <img class="alert-img" src={alertSvg} alt="" />
    <h2>{serviceAlerts.length} alerts</h2>
    <img class="chevron-img img-invert" src={chevronRightSvg} alt="" /></summary
  >
  {#each serviceAlerts as alert, key (key)}
    {@const descriptionTranslation = alert.descriptionText?.translation}
    {@const descriptionText =
      descriptionTranslation && descriptionTranslation.length > 0
        ? (descriptionTranslation.find((i) => i.language === language) || descriptionTranslation[0])
            .text
        : null}
    {@const headerTranslation = alert.headerText?.translation}
    {@const headerText =
      headerTranslation && headerTranslation.length > 0
        ? (headerTranslation.find((i) => i.language === language) || headerTranslation[0]).text
        : 'Service Alert'}
    <details class="alert" name="alert">
      <summary>
        <img class="alert-img" src={alertSvg} alt="" />
        <h3>{headerText}</h3>
        <img class="chevron-img img-invert" src={chevronRightSvg} alt="" />
      </summary>
      {#if descriptionText}
        <div class="alert-content">
          {#each descriptionText.split('\n') as segment, segmentKey (segmentKey)}
            <p>{segment}</p>
          {/each}
        </div>
      {/if}
    </details>
  {/each}
</details>

<style>
  summary {
    cursor: default;
    padding: 0.5rem 0.75rem;
    background: #ca007611;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    list-style-type: none;

    &:hover {
      background: #ca007619;
    }
    &:active {
      background: #ca007622;
    }
  }
  .chevron-img {
    transform: rotate(90deg);
  }
  details[open] > summary .chevron-img {
    transform: rotate(-90deg);
  }
  h2,
  h3 {
    flex: 1;
    margin: 0;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
  }
  h3 {
    font-size: 15px;
    font-weight: 500;
  }
  img {
    width: 16px;
    height: 16px;
  }
  .main-details {
    border: 0.5px solid #ca0076;
    margin: 0.5rem;
    border-radius: var(--base-border-radius);
    font-size: 16px;
    box-shadow: var(--surface-shadow);

    &::selection {
      background-color: #ca0076;
      color: #fff;
    }

    &.compact {
      border-radius: 0;
      border-left: 0;
      border-right: 0;
      margin: 0;
    }

    &.single {
      &::details-content {
        content-visibility: visible;
      }
      > summary {
        display: none;
      }
      .alert-img {
        display: inline-block;
      }
      .alert {
        border-top: 0;
      }
    }

    &.single h3 {
      font-weight: 600;
    }
  }
  .alert {
    background: #ca007611;
    border-top: 1px solid #ca007644;

    summary {
      list-style-type: none;
      font-weight: 500;
    }
    .alert-img {
      display: none;
    }
  }
  .alert-content {
    padding: 0.25rem 0.75rem 0.75rem;
    background: #ca007611;
  }

  p {
    margin: 0.5em 0 0.75em;
    font-size: 14px;
    line-height: 1.35;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
