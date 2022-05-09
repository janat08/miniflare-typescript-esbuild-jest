
import { Router} from 'itty-router'
import home from './response'
import todos from './todos'

const API = Router()

API.get('/', async (event, env, ctx)=>{
  const {list} = todos(env)
  return home(await list())
})

API.get('/incomplete', async (event, env, ctx)=>{
  const {list} = todos(env)
  return home(await list('false'))
})

//real api stuff, proper http method isn't used 
API.post('/add', async (req, env)=>{
  const {insert} = todos(env)
  const formData = await req.formData();
  const body = {};
  for (const entry of formData.entries()) {
    body[entry[0]] = entry[1];
  }
  await insert({createdAt: Date.now(), ...body})
  return new Response('', {
    status: 302,
    headers: {
      'Location': 'http://localhost:8787',
    },
  })
})

API.get('/complete/:createdAt', async (req, env)=>{
  console.log('params', req.params.createdAt)
  const {find, save, destroy} = todos(env)
  const createdAt = req.params.createdAt
  const {val} = await find(createdAt)

  //since we're changing a key value too, we can't overwrite a record
  await save({createdAt, completed: true, val})
  await destroy({createdAt, completed: false})
  return new Response('', {
    status: 302,
    headers: {
      'Location': 'http://localhost:8787',
    },
  })
})

API.get('/delete/:createdAt/:completed', async (req, env)=>{
  const {destroy} = todos(env)
  const {createdAt, completed} = req.params

  await destroy({createdAt, completed})
  return new Response('', {
    status: 302,
    headers: {
      'Location': 'http://localhost:8787',
    },
  })
})


export default{
  async fetch(request, environment, ctx){    
    return await API.handle(request,environment,ctx)
  }
}
