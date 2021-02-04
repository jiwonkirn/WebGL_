let gl
let canvas
let shaderProgram
let vertexBuffer

function createGLContext(canvas) {
  const names = ['webgl', 'experimental-webgl']
  let context = null
  for (let i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i])
    } catch (e) {}
    if (context) {
      break
    }
  }
  if (context) {
    context.viewportWidth = canvas.width
    context.viewportHeight = canvas.height
  } else {
    alert('Failed to create WebGL context!')
  }
  return context
}

// 셰이더를 만든 뒤 소스코드를 객체에 로드한 후 컴파일
function loadShader(type, shaderSource) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  // 세이더 컴파일 에러가 발생하는 경우 셰이더 삭제
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('Error compiling shader' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function setupShaders() {
  const vertexShaderSource = `
    attribute vec3 aVertexPosition;
    void main() {
      gl_Position = vec4(aVertexPosition, 1.0);
    }
  `

  const fragmentShaderSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `

  const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

  // 셰이더를 프로그램 객체에 붙이고 이를 셰이더 프로그램에 링크
  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Failed to setup shaders')
  }

  // 해당 프로그램 객체를 렌더링에 사용
  gl.useProgram(shaderProgram)

  // 버텍스 셰이더의 어트리뷰트 변수 위차를 제네릭 어트리뷰트 인덱스에 할당
  // webGL에는 고정된 수량의 어트리뷰트 슬롯이 있으며, 제네릭 어트리뷰트 인덱스는 이러한 슬롯을 구분하는데 사용된다.
  // 버텍스 셰이더의 각각의 어트리뷰트를 구분하는데 제네릭 어트리뷰트를 인덱스를 알고 있어야 그리기 과정에서
  // 버퍼의 버텍스 데이터를 버텍스 셰이더의 어트리뷰트와 일치시킬 수 있다.
  // getAttribLocation는 링크 이후에 특정 어트리뷰트에 어떤 제네릭 어트리뷰트 인덱스가 쓰였는지 얻어오는 메소드이고,
  // gl.bindAttribLocation은 일크 전에 어떤 인덱스를 어트리뷰트에 바인딩하는지 지정한다.
  // ㄴ 인덱스를 지정했기 때문에 그리기 과중 중에 해당 인덱스를 사용해 어트리뷰트에 접근할 수 있다.
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
}

function setupBuffers() {
  vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  const triangleVertices = [0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

  vertexBuffer.itemSize = 3 // 각 어트리뷰트에 얼마나 많은 원소가 있는지
  vertexBuffer.numberOfItems = 3 // 버퍼에 몇개의 아이템 혹은 버텍스가 있는지
  // 이런 방식으로 프로퍼티를 생성하는 것은 컨텍스트를 잃어버리는 경우에 좋은 방법이 아니다.
}

function draw() {
  // 뷰포트 설정. 그리기 버퍼 안에 그려지는 렌더링 결과의 위치를 결정한다.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  // clearColor로 결정된 색상으로 색상 버퍼를 채운다.
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 첫번째 인자인 어트리뷰트에 gl.ARRAY_BUFFER 타깃에 바인딩된 WebGLBuffer 객체를 할당한다.
  // 두번째 인자는 어트리뷰트 한개의 요소 개수나 크기를 지정
  // 세번쨰 인자는 버텍스 객체의 값을 float으로 해석하도록 지정한다. 만약 float이 아닐 경우 데이터는 버텍스 셰이더에서 사용핮기 전에 float 형태로 변환해야 한다.
  // 네번째 인자는 정규화 플래그로, float이 아닌 데이터에 대해 float으로 변환할지 결정한다.
  // 다섯번째 인자는 stride로 불리며 값이 0인 경우 메모리상에 연속적으로 저장되지 않음을 의미한다.
  // 여섯번째 인자는 버퍼의 오프셋으로, 예제의 데이터는 버퍼의 시작점부터 시작하기 때문에 인자는 0이다.
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)

  gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems)
}

function startup() {
  canvas = document.getElementById('myGLCanvas')
  gl = createGLContext(canvas)

  setupShaders()
  setupBuffers()

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  draw()
}

// 웹지엘이 오류 발생을 감지하면 내장된 오류 코드를 생성한다.
// 오류가 생성되고 나면, 다음과 같은 메소드를 호출할 때까지 다른 오류는 더이상 생성되지 않는다.

// 내장된 오류를 조회하는 쿼리.
// gl.getErrors()
// 현재 오류코드를 반환하며 현재 오류 상태를 gl.NO_ERROR로 재설정한다.
