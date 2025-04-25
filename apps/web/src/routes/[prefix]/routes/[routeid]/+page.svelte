<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'
</script>

<Header title={page.params.routeid} />

Route info...
