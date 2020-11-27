import ImageLoader from './utils/image-loader'
import resource from './config/resource'
import ui from './config/ui'
import Turntable from './turntable'

const prizes = [
  {
    title: '奖品一'
  },
  {
    title: '奖品二'
  },
  {
    title: '奖品三'
  },
  {
    title: '奖品四'
  },
  {
    title: '奖品五'
  },
  {
    title: '奖品六'
  },
  {
    title: '奖品七'
  },
  {
    title: '奖品八'
  },
  {
    title: '奖品九'
  },
  {
    title: '奖品十'
  },
  {
    title: '奖品十一'
  },
  {
    title: '奖品十二'
  }
]

console.log('start load')
ImageLoader.load(resource.img, (i, total) => {
  console.log('=====', i)
  // load image completed
  if (i === total - 1) {
    init()
  }
})

function init () {
  const canvas = document.querySelector('#game-canvas')
  canvas.width = ui.canvas_width
  canvas.height = ui.canvas_height

  const ctx = canvas.getContext('2d')
  const turntable = new Turntable(prizes)
  turntable.setContext(ctx)
  turntable.start()
}

