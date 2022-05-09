import { html, HTMLResponse } from '@worker-tools/html'

const head = html`<script
  src='https://cdn.skypack.dev/pin/@hotwired/turbo@v7.1.0-V83RMQBlYCPK9CvTqQoL/mode=imports,min/optimized/@hotwired/turbo.js'>
</script>`
const title = 'Counter'

export default async function view(todos, responseInit) {

  return render({
    content: html`
      <a href='/incomplete'>incomplete only</a>
      <a href="/">all items</a>
      <ul>
      ${todos.sort((x, y)=>x.createdAt<y.createdAt).map((x,i) => html`
        <li>${x.completed}: ${x.val}<a href='/delete/${x.createdAt}/${x.completed}'>delete</a> <a href='/complete/${x.createdAt}'>complete</a></li>
      `)}
      </ul>
      <form action='/add' method='POST' enctype='multipart/form-data'>
        <input type='text' name="val">
        <input type='submit' value='Add'>
      </form>
`,
    head,
    title,
    responseInit
  })
}

export function layout({ content, title = '', head }) {
  const headEmpty = head || html``
  return html`
<!DOCTYPE html>
<html>

<head>
  <title>${title}</title>
  ${headEmpty}
</head>

<body>
  ${content}
  <footer>
    Happy coding
  </footer>
</body>

</html>
`
}

export function render({ responseInit = {}, ...payload }) {
  return new HTMLResponse(layout(payload), responseInit)
}
