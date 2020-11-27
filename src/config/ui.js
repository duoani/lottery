const canvasWidth = 600
const canvasHeight = 600
const center = [canvasWidth / 2, canvasHeight / 2]
export default {
  canvas_width: canvasWidth,
  canvas_height: canvasHeight,
  plate_radius: canvasWidth / 2,
  plate_center: center,
  prize_area_radius: 249,
  prize_title_radius: 200,
  start_btn_radius: 30,
  arrow_vertex_arr: [
    [center[0] - 10, center[1] - 20],
    [center[0], center[1] - 80],
    [center[0] + 10, center[1] - 20]
  ],
  rotate_duration: 6000
}
