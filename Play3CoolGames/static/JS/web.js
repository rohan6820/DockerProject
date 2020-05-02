const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')


let state = initialState()


const x = c => Math.round(c * canvas.width / state.cols)
const y = r => Math.round(r * canvas.height / state.rows)

const draw = () => {
 
  ctx.fillStyle = '#232323'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgb(0,200,50)'
  state.snake.map(p => ctx.fillRect(x(p.x), y(p.y), x(1), y(1)))

  ctx.fillStyle = 'rgb(255,50,0)'
  ctx.fillRect(x(state.apple.x), y(state.apple.y), x(1), y(1))

 
  if (state.snake.length == 0) {
    ctx.fillStyle = 'rgb(255,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}


const step = t1 => t2 => {
  if (t2 - t1 > 100) {
    state = next(state)
    draw()
    window.requestAnimationFrame(step(t2))
  } else {
    window.requestAnimationFrame(step(t1))
  }
}


window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'w': case 'h': case 'ArrowUp':    state = enqueue(state, NORTH); break
    case 'a': case 'j': case 'ArrowLeft':  state = enqueue(state, WEST);  break
    case 's': case 'k': case 'ArrowDown':  state = enqueue(state, SOUTH); break
    case 'd': case 'l': case 'ArrowRight': state = enqueue(state, EAST);  break
  }
})

draw(); window.requestAnimationFrame(step(0))
