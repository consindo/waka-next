<script lang="ts">
  import close from '../../icons/close.svg'

  const { title, subtitle = '' } = $props()
</script>

<header>
  <div>
    <h1 {title}>{title}</h1>
    {#if subtitle !== ''}<h2>{subtitle}</h2>{/if}
  </div>
  <a
    href="/"
    onclick={(e) => {
      // todo: needs to check if the previous item in history has a different pathname
      if (window.history.length > 0) {
        e.preventDefault()
        window.history.back()
      }
    }}
  >
    <img src={close} alt="Close" class="img-invert" />
  </a>
</header>

<style>
  header {
    display: flex;
    padding: 0 calc(var(--edge-padding) - 0.25rem) 0 var(--edge-padding);
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-bg);
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 5;
    height: 48px;
  }
  header div {
    overflow-x: hidden;
    flex: 1;
  }
  h1 {
    font-size: 1rem;
    margin: 0;
    white-space: pre;
    text-overflow: ellipsis;
    width: 100%;
    overflow-x: hidden;
  }
  h2 {
    font-size: 13px;
    margin: 1px 0 0;
    font-weight: normal;
    color: var(--surface-text-subtle);
  }
  a {
    background: transparent;
    border: 0;
    display: flex;
    align-items: center;
    cursor: default;
    padding: 0.25rem;
    border-radius: 50%;
  }
  a:hover {
    background: var(--surface-bg-hover);
  }
  img {
    width: 24px;
    height: 24px;
  }
</style>
