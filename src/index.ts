
import { Router} from 'itty-router'
// import { ThrowableRouter, missing, withParams } from 'itty-router-extras'
import home from './response'
import todos from './todos'
import { withContent, ThrowableRouter, StatusError } from 'itty-router-extras'

const API = Router()

API.get('/', async (event, env, ctx)=>{
  const {list, find} = todos(env)

  console.log( 'list', await list())
  return home(await list())
})

API.get('/incomplete', async (event, env, ctx)=>{
  const {list} = todos(env)
  console.log(213, await list('false'))
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

  await save({createdAt, completed: true, val})
  await destroy({createdAt, completed: false})
  return new Response('', {
    status: 302,
    headers: {
      'Location': 'http://localhost:8787',
    },
  })
})

API.get('/delete/:createdAt', async (req, env)=>{
  const {destroy} = todos(env)
  const createdAt = req.params.createdAt
  await destroy({createdAt, completed: false})
  await destroy({createdAt, completed: true})
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


export { Counter } from "./counter";
