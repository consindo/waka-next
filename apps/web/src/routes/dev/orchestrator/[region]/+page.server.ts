import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  const { importResult } = locals
  return {
    importResult,
  }
}

export const actions = {
  import: async ({ locals, fetch, params, request }) => {
    const { region } = params
    const data = await request.formData()
    const token = data.get('token')
    const result = await fetch(`/api/${region}/admin/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    }).then((r) => r.json())
    locals.importResult = { [region]: result }
  },
  activate: async ({ fetch, params, request }) => {
    const { region } = params
    const data = await request.formData()
    const token = data.get('token')
    const version = data.get('version')
    await fetch(`/api/${region}/admin/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ version }),
    }).then((r) => r.json())
  },
} satisfies Actions
