/**
 * @private
 */
var list = {}
/**
 * @private
 */
var loadImage = function(item, callback) {
  var image = new Image()
  image.onload = function() {
    list[item.id] = image
    callback()
  }
  image.src = item.src
}
/**
 * 加载图片资源
 * @param {Array} images @format {id: '', src: ''}
 * @param {Function} statechange @param {Number} index
 */
function load (images, statechange, index) {
  index = index || 0
  if (images[index]) {
    loadImage(images[index], function() {
      statechange(index, images.length)
      load(images, statechange, index + 1)
    })
  }
}

/**
 * 获取已加载的Image对象
 * @param {String} id
 */
function get (id) {
  return list[id]
}

export default {
  load,
  get
}
