// 名字列表
const names = [
  "方子木", "裴翎雅", "黄馨逸", "晁天佑", "钱运陆", "陈溪垚", 
  "查宇浩", "李玟晔", "谯易汶", "韩贝可欣", "韦依伶", "唐梓轩", 
  "刘延锐", "王誉岐", "朱雅琳", "龚轩逸", "房业辰", "袁一航", 
  "刘柚彤", "向彦羲", "罗熙又", "陈柏凌", "严浚哲", "饶启源", 
  "龙昭邑", "龙昱旋"
];

// 字体列表
const fontFamilies = [
  "'Source Han Sans CN'", "'Microsoft YaHei'", "'SimHei'", 
  "'KaiTi'", "'SimSun'", "'NSimSun'", "'FangSong'"
];

// 名字对象数组
let nameObjects = [];
// 星星数组
let stars = [];
// 闪烁计时器
let blinkTimer = 0;
// 闪烁状态
let isBlinking = false;
// 闪烁间隔（毫秒）
const blinkInterval = 1500;
// 闪烁持续时间（毫秒）
const blinkDuration = 200;

function setup() {
  // 创建16:9比例的画布
  let canvasWidth = windowWidth;
  let canvasHeight = (canvasWidth * 9) / 16;
  
  // 如果计算的高度超过窗口高度，则基于窗口高度计算宽度
  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight;
    canvasWidth = (canvasHeight * 16) / 9;
  }
  
  createCanvas(canvasWidth, canvasHeight);
  textAlign(CENTER, CENTER);
  
  // 创建星星
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      twinkleSpeed: random(0.01, 0.05)
    });
  }
  
  // 初始化名字对象
  initializeNames();
}

function draw() {
  // 绘制太空背景
  background(0);
  drawStars();
  
  // 更新闪烁状态
  updateBlinkState();
  
  // 绘制名字
  drawNames();
}

// 初始化名字对象
function initializeNames() {
  nameObjects = [];
  
  for (let i = 0; i < names.length; i++) {
    let validPosition = false;
    let newName;
    
    // 尝试找到不重叠的位置
    let attempts = 0;
    while (!validPosition && attempts < 100) {
      attempts++;
      
      // 创建新的名字对象
      newName = {
        text: names[i],
        x: random(width * 0.1, width * 0.9),
        y: random(height * 0.1, height * 0.9),
        size: random(16, 32),
        color: [random(100, 255), random(100, 255), random(100, 255)],
        fontFamily: random(fontFamilies),
        rotation: random(-15, 15),
        targetX: 0,
        targetY: 0,
        targetSize: 0,
        targetColor: [0, 0, 0],
        targetFontFamily: '',
        targetRotation: 0
      };
      
      // 计算名字的宽度和高度
      textSize(newName.size);
      let nameWidth = textWidth(newName.text) + 10;
      let nameHeight = newName.size + 10;
      
      // 检查是否与现有名字重叠
      validPosition = true;
      for (let j = 0; j < nameObjects.length; j++) {
        let other = nameObjects[j];
        textSize(other.size);
        let otherWidth = textWidth(other.text) + 10;
        let otherHeight = other.size + 10;
        
        // 检查碰撞
        if (
          newName.x - nameWidth/2 < other.x + otherWidth/2 &&
          newName.x + nameWidth/2 > other.x - otherWidth/2 &&
          newName.y - nameHeight/2 < other.y + otherHeight/2 &&
          newName.y + nameHeight/2 > other.y - otherHeight/2
        ) {
          validPosition = false;
          break;
        }
      }
    }
    
    // 如果找到有效位置，添加到数组
    if (validPosition) {
      // 设置初始目标值与当前值相同
      newName.targetX = newName.x;
      newName.targetY = newName.y;
      newName.targetSize = newName.size;
      newName.targetColor = [...newName.color];
      newName.targetFontFamily = newName.fontFamily;
      newName.targetRotation = newName.rotation;
      
      nameObjects.push(newName);
    } else {
      // 如果无法找到位置，缩小尺寸再试
      i--;
    }
  }
}

// 更新闪烁状态
function updateBlinkState() {
  // 更新闪烁计时器
  blinkTimer += deltaTime;
  
  // 检查是否应该开始闪烁
  if (!isBlinking && blinkTimer >= blinkInterval) {
    isBlinking = true;
    blinkTimer = 0;
    
    // 为每个名字设置新的目标值
    for (let name of nameObjects) {
      // 保存当前位置作为起始位置
      name.startX = name.x;
      name.startY = name.y;
      name.startSize = name.size;
      name.startColor = [...name.color];
      name.startFontFamily = name.fontFamily;
      name.startRotation = name.rotation;
      
      // 设置新的目标位置
      name.targetX = random(width * 0.1, width * 0.9);
      name.targetY = random(height * 0.1, height * 0.9);
      name.targetSize = random(16, 32);
      name.targetColor = [random(100, 255), random(100, 255), random(100, 255)];
      name.targetFontFamily = random(fontFamilies);
      name.targetRotation = random(-15, 15);
    }
    
    // 检查并解决重叠问题
    resolveOverlaps();
  }
  
  // 检查是否应该结束闪烁
  if (isBlinking && blinkTimer >= blinkDuration) {
    isBlinking = false;
    
    // 更新所有名字的位置到目标位置
    for (let name of nameObjects) {
      name.x = name.targetX;
      name.y = name.targetY;
      name.size = name.targetSize;
      name.color = [...name.targetColor];
      name.fontFamily = name.targetFontFamily;
      name.rotation = name.targetRotation;
    }
  }
}

// 解决重叠问题
function resolveOverlaps() {
  // 多次迭代以解决重叠
  for (let iteration = 0; iteration < 5; iteration++) {
    for (let i = 0; i < nameObjects.length; i++) {
      let nameA = nameObjects[i];
      
      for (let j = i + 1; j < nameObjects.length; j++) {
        let nameB = nameObjects[j];
        
        // 计算名字的宽度和高度
        textSize(nameA.targetSize);
        let widthA = textWidth(nameA.text) + 10;
        let heightA = nameA.targetSize + 10;
        
        textSize(nameB.targetSize);
        let widthB = textWidth(nameB.text) + 10;
        let heightB = nameB.targetSize + 10;
        
        // 检查目标位置是否重叠
        if (
          nameA.targetX - widthA/2 < nameB.targetX + widthB/2 &&
          nameA.targetX + widthA/2 > nameB.targetX - widthB/2 &&
          nameA.targetY - heightA/2 < nameB.targetY + heightB/2 &&
          nameA.targetY + heightA/2 > nameB.targetY - heightB/2
        ) {
          // 计算重叠的中心点
          let centerX = (nameA.targetX + nameB.targetX) / 2;
          let centerY = (nameA.targetY + nameB.targetY) / 2;
          
          // 计算从中心点推开的向量
          let dirX_A = nameA.targetX - centerX;
          let dirY_A = nameA.targetY - centerY;
          let dirX_B = nameB.targetX - centerX;
          let dirY_B = nameB.targetY - centerY;
          
          // 标准化向量
          let lenA = Math.sqrt(dirX_A * dirX_A + dirY_A * dirY_A) || 1;
          let lenB = Math.sqrt(dirX_B * dirX_B + dirY_B * dirY_B) || 1;
          
          dirX_A /= lenA;
          dirY_A /= lenA;
          dirX_B /= lenB;
          dirY_B /= lenB;
          
          // 移动名字以避免重叠
          nameA.targetX = constrain(nameA.targetX + dirX_A * 10, widthA/2, width - widthA/2);
          nameA.targetY = constrain(nameA.targetY + dirY_A * 10, heightA/2, height - heightA/2);
          nameB.targetX = constrain(nameB.targetX + dirX_B * 10, widthB/2, width - widthB/2);
          nameB.targetY = constrain(nameB.targetY + dirY_B * 10, heightB/2, height - heightB/2);
        }
      }
    }
  }
}

// 绘制名字
function drawNames() {
  for (let name of nameObjects) {
    push();
    
    // 如果正在闪烁，计算插值位置
    if (isBlinking) {
      // 闪烁效果 - 在原始位置和目标位置之间快速切换
      if ((blinkTimer / 50) % 2 < 1) {
        // 使用起始值
        translate(name.startX, name.startY);
        rotate(radians(name.startRotation));
        textSize(name.startSize);
        fill(name.startColor);
        textFont(name.startFontFamily);
      } else {
        // 使用目标值
        translate(name.targetX, name.targetY);
        rotate(radians(name.targetRotation));
        textSize(name.targetSize);
        fill(name.targetColor);
        textFont(name.targetFontFamily);
      }
    } else {
      // 正常显示
      translate(name.x, name.y);
      rotate(radians(name.rotation));
      textSize(name.size);
      fill(name.color);
      textFont(name.fontFamily);
    }
    
    // 绘制文本
    text(name.text, 0, 0);
    
    pop();
  }
}

// 绘制星星
function drawStars() {
  for (let star of stars) {
    // 星星闪烁效果
    let brightness = 150 + 105 * sin(frameCount * star.twinkleSpeed);
    fill(brightness);
    noStroke();
    ellipse(star.x, star.y, star.size);
  }
}

// 窗口大小改变时调整画布
function windowResized() {
  let canvasWidth = windowWidth;
  let canvasHeight = (canvasWidth * 9) / 16;
  
  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight;
    canvasWidth = (canvasHeight * 16) / 9;
  }
  
  resizeCanvas(canvasWidth, canvasHeight);
  
  // 重新初始化名字位置
  initializeNames();
}