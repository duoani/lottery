import ImageLoader from './utils/image-loader'
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
import ui from './config/ui'

function easeInOutCubic (t, b, c, d) {
  if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b
  return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
}

export default class Turntable {
  constructor (prizes = []) {
    this.prizes = prizes

    this.oriX = ui.plate_center[0]
    this.oriY = ui.plate_center[1]
    this.radius = ui.plate_radius
    this.rotateDuration = ui.rotate_duration
    this.rotateDistance = 0
    this.startRadian = 0
    this.ctx = null
    this.rotating = false
  }
  setContext (ctx) {
    this.ctx = ctx
    this.currentTime = 0
  }
  start () {
    this.render()
    this.bindEvents()
  }
  bindEvents () {
    const { ctx } = this
    const { canvas } = ctx
    // 按钮点击
    canvas.addEventListener('click', e => {
      // 只要抽奖没有结束，就不让再次抽奖
      if (this.rotating) {
        return
      }
      this.rotating = true
      if (this.isInBtn(e)) {
        // 每次点击抽奖，我们都将初始化角度重置
        this.startRadian = 0
        // distance是我们计算出的将指定奖品旋转到指针处需要旋转的角度距离，distanceToStop下面会又说明
        const distance = this.distanceToStop()
        this.startRotate(distance)
      }
    })
    // 按钮 hover
    canvas.addEventListener('mousemove', e => {
      if (this.isInBtn(e)) {
        canvas.style.cursor = 'pointer'
      } else {
        canvas.style.cursor = 'default'
      }
    })
  }
  isInBtn (e) {
    const pos = this.windowToCanvas(e)
    // 如果点击坐标与圆点的距离少于按钮圆的半径，则认为是点中按钮
    const distance = Math.sqrt(Math.pow(pos.x - this.oriX, 2) + Math.pow(pos.y - this.oriY, 2))
    return distance < ui.start_btn_radius
  }
  startRotate (distance) {
    this._lastTime = Date.now()
    this.currentTime = 0
    this.rotateDistance = distance
    this.rotate(0)
  }
  rotate (delta) {
    const distance = this.rotateDistance
    this.currentTime += delta
    this.startRadian = easeInOutCubic(this.currentTime, 0, this.rotateDistance, this.rotateDuration)

    if (this.startRadian > distance) {
      this.startRadian = distance
    }
    // 初始角度改变后，我们需要重新绘制
    // 当最后我们的目标距离与startRadian之间的差距低于0.05时，我们就默认奖品抽完了，可以继续抽下一个了。
    this.render()
    if (distance - this.startRadian <= 0.05) {
      this.rotating = false
      return
    }
    // 循环调用rotatePanel函数，使得转盘的绘制连续，造成旋转的视觉效果
    setTimeout(() => {
      const now = Date.now()
      const delta = now - this._lastTime
      this._lastTime = now
      this.rotate(delta)
    }, 1000 / 60)
  }
  // 这个方法是为了将canvas再window中的坐标点转化为canvas中的坐标点
  windowToCanvas(e) {
  // getBoundingClientRect这个方法返回html元素的大小及其相对于视口的位置
    const canvasPostion = this.ctx.canvas.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    return {
      x: x - canvasPostion.left,
      y: y - canvasPostion.top
    }
  }
  distanceToStop() {
    // middleDegrees为奖品块的中间角度（我们最终停留都是以中间角度进行计算的）距离初始
    // 的startRadian的距离，distance就是当前奖品跑到指针位置要转动的距离。
    let middleDegrees = 0
    let distance = 0
    // 映射出每个奖品的middleDegrees
    const awardsToDegreesList = this.prizes.map((data, index) => {
      const awardRadian = (Math.PI * 2) / this.prizes.length
      return awardRadian * index + (awardRadian * (index + 1) - awardRadian * index) / 2
    })
    // 随机生成一个索引值，来表示我们此次抽奖应该中的奖品
    const currentPrizeIndex = Math.floor(Math.random() * this.prizes.length)
    console.log('当前奖品应该中的奖品是：' + this.prizes[currentPrizeIndex].title)
    middleDegrees = awardsToDegreesList[currentPrizeIndex]
    // 因为指针是垂直向上的，相当坐标系的Math.PI/2,所以我们这里要进行判断来移动角度
    distance = Math.PI * 3 / 2 - middleDegrees
    distance = distance > 0 ? distance : Math.PI * 2 + distance
    // 这里额外加上后面的值，是为了让转盘多转动几圈，看上去更像是在抽奖
    return distance + Math.PI * 100
  }
  render () {
    const ctx = this.ctx
    this.drawPlate(ctx)
    this.drawPrizeArea(ctx)
    this.drawBtn(ctx)
    this.drawArrow(ctx)
  }

  // 绘制圆盘
  drawPlate (ctx) {
    // 绘制转盘
    ctx.save()
    ctx.translate(this.oriX, this.oriY)
    ctx.rotate(this.startRadian)
    ctx.drawImage(ImageLoader.get('plate'), -this.radius, -this.radius, this.radius * 2, this.radius * 2)
    ctx.restore()
  }

  // 绘制奖项扇区
  drawPrizeArea (ctx) {
    // 多少个奖品就绘制多少个扇区
    const prizeAmount = this.prizes.length
    // 每个扇区的弧度
    const prizeRadian = Math.PI * 2 / prizeAmount
    // 起始弧度值
    let { startRadian } = this
    for (let i = 0; i < prizeAmount; i++) {
      ctx.save()
      ctx.beginPath()
      ctx.fillStyle = colors[i % colors.length]
      // 这里需要使用 moveTo 方法将初始位置定位在圆点处,这样绘制的圆
      // 弧都会以圆点作为闭合点,下面有使用 moveTo 和不使用 moveTo 的对比图
      ctx.moveTo(this.oriX, this.oriY)
      // 画圆弧时,每次都会自动调用moveTo,将画笔移动到圆弧的起点,半
      // 径我们设置的比转盘稍小一点
      ctx.arc(this.oriX, this.oriY, ui.prize_area_radius, startRadian, startRadian + prizeRadian, false)
      ctx.fill()
      ctx.restore()
      // 开始绘制我们的文字
      ctx.save()
      // 设置文字颜色
      ctx.fillStyle = '#FFFFFF'
      // 设置文字样式
      ctx.font = '14px Arial'
      // 改变canvas原点的位置,简单来说,translate到哪个坐标点,那么那个坐标点就将变为坐标(0, 0)
      ctx.translate(
        ui.plate_center[0] + Math.cos(startRadian + prizeRadian / 2) * ui.prize_title_radius,
        ui.plate_center[1] + Math.sin(startRadian + prizeRadian / 2) * ui.prize_title_radius
      )
      // 旋转角度,这个旋转是相对于原点进行旋转的.
      ctx.rotate(startRadian + prizeRadian / 2 + Math.PI / 2)
      // 这里就是根据我们获取的各行的文字进行绘制,maxLineWidth我们取70,相当与
      // 一行我们最多展示5个文字
      this.getLineTextList(ctx, this.prizes[i].title, 70).forEach((line, index) => {
      // 绘制文字的方法,三个参数分别带别:要绘制的文字,开始绘制的x坐标,开始绘制的y坐标
        ctx.fillText(line, -ctx.measureText(line).width / 2, ++index * 25)
      })
      ctx.restore()

      startRadian += prizeRadian
    }
  }

  // 想一想,如我们一等奖那样,文字特别长的,超出我们的奖品块,而canvas
  // 却不是那么智能给你提供自动换行的机制,于是我们只有手动处理换行
  /**
 *
 * @param {*} ctx         这个就不用解释了~
 * @param {*} text            这个是我们需要处理的长文本
 * @param {*} maxLineWidth    这个是我们自己定义的一行文本最大的宽度
 */
  // 整个思路就是将满足我们定义的宽度的文本作为value单独添加到数组中
  // 最后返回的数组的每一项就是我们处理后的每一行了.
  getLineTextList(ctx, text, maxLineWidth) {
    const wordList = text.split('')
    let tempLine = ''
    const lineList = []
    for (let i = 0; i < wordList.length; i++) {
    // measureText方法是测量文本的宽度的,这个宽度相当于我们设置的
    // fontSize的大小,所以基于这个,我们将maxLineWidth设置为当前字体大小的倍数
      if (ctx.measureText(tempLine).width >= maxLineWidth) {
        lineList.push(tempLine)
        maxLineWidth -= ctx.measureText(text[0]).width
        tempLine = ''
      }
      tempLine += wordList[i]
    }
    lineList.push(tempLine)
    return lineList
  }

  // 绘制按钮，以及按钮上start的文字
  drawBtn (ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = '#ff0000'
    ctx.arc(this.oriX, this.oriY, ui.start_btn_radius, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()
  }

  // 绘制箭头，用来指向我们抽中的奖品
  drawArrow (ctx) {
    const vertex = ui.arrow_vertex_arr
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = '#ff0000'
    ctx.moveTo(vertex[0][0], vertex[0][1])
    ctx.lineTo(vertex[1][0], vertex[1][1])
    ctx.lineTo(vertex[2][0], vertex[2][1])
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}
