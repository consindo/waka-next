<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()
</script>

<Header title={page.params.routeid} />

Route info...

<pre>
  {JSON.stringify(data)}
</pre>
