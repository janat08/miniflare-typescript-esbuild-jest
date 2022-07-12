import { Router } from 'itty-router'

// now let's create a router (note the lack of "new")
const router = Router()

// GET collection index
router.get('/todos', () => new Response('Todos Index!'))

// GET item
router.get('/todos/:id', ({ params }) => new Response(`Todo #${params.id}`))

// POST to the collection (we'll use async here)
router.post('/todos', async request => {
  const content = await request.json()

  return new Response('Creating Todo: ' + JSON.stringify(content))
})

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))


export default {fetch: router.handle}