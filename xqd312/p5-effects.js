// 极简炫酷的P5.js效果脚本
let particles = [];
let gridLines = [];
let mouseEffect;
let isLightMode = false;

// P5.js 实例化，以避免与全局冲突
const sketch = (p) => {
  // 色彩变量
  let darkBgColor;
  let lightBgColor;
  let primaryColor;
  let secondaryColor;
  let accentColor;
  
  p.setup = function() {
    // 创建与窗口大小相同的画布
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-10');
    canvas.style('position', 'fixed');
    canvas.style('pointer-events', 'none');
    
    // 初始化颜色
    updateColors();
    
    // 初始化粒子系统 - 增加到60个粒子
    for (let i = 0; i < 60; i++) {
      particles.push(new MinimalParticle(p));
    }
    
    // 初始化网格线 - 只有少量水平和垂直线
    createGridLines();
    
    // 初始化鼠标效果
    mouseEffect = new MinimalMouseEffect(p);
    
    // 检测主题模式
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        isLightMode = document.body.classList.contains('light-mode');
        updateColors();
        
        // 重置粒子颜色
        particles.forEach(particle => {
          particle.resetColor();
        });
      });
    }
  };
  
  p.draw = function() {
    // 清晰的背景 - 没有半透明效果，避免视觉混乱
    if (isLightMode) {
      p.background(lightBgColor);
    } else {
      p.background(darkBgColor);
    }
    
    // 绘制网格线 - 静态但具有深度感
    drawGridLines();
    
    // 更新和显示所有粒子
    for (let particle of particles) {
      particle.update();
      particle.display();
    }
    
    // 更新和显示鼠标效果
    mouseEffect.update();
    mouseEffect.display();
  };
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    createGridLines(); // 重新创建网格线以适应新尺寸
  };
  
  p.mouseMoved = function() {
    mouseEffect.addPoint(p.mouseX, p.mouseY);
  };
  
  // 创建网格线
  function createGridLines() {
    gridLines = [];
    
    // 确定网格间距 - 较大间距使界面更加简洁
    const spacing = 120;
    
    // 水平线
    for (let y = spacing; y < p.height; y += spacing) {
      gridLines.push({
        x1: 0,
        y1: y,
        x2: p.width,
        y2: y,
        alpha: 15,  // 非常低的不透明度
        direction: 'horizontal'
      });
    }
    
    // 垂直线
    for (let x = spacing; x < p.width; x += spacing) {
      gridLines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: p.height,
        alpha: 15,
        direction: 'vertical'
      });
    }
  }
  
  // 绘制网格线
  function drawGridLines() {
    p.strokeWeight(1);
    
    for (let line of gridLines) {
      // 根据主题设置不同的线条颜色
      const lineColor = isLightMode ? p.color(0, 0, 0, line.alpha) : p.color(255, 255, 255, line.alpha);
      p.stroke(lineColor);
      p.line(line.x1, line.y1, line.x2, line.y2);
    }
  }
  
  // 更新颜色函数
  function updateColors() {
    const computedStyle = getComputedStyle(document.documentElement);
    
    darkBgColor = p.color(10, 10, 20); // 更深、更沉稳的背景色
    lightBgColor = p.color(248, 248, 252); // 更柔和的白色
    
    // 获取主色、次色和强调色
    const primaryColorValue = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColorValue = computedStyle.getPropertyValue('--secondary-color').trim();
    const accentColorValue = computedStyle.getPropertyValue('--accent-color').trim();
    
    // 解析颜色
    primaryColor = p.color(primaryColorValue || '#00F7FF');
    secondaryColor = p.color(secondaryColorValue || '#B56BFF');
    accentColor = p.color(accentColorValue || '#FF6B35');
  }
  
  // 极简风格粒子
  class MinimalParticle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
      this.size = p.random(3, 7);
      this.resetColor();
      this.pulsePhase = p.random(p.TWO_PI);
      this.pulseSpeed = p.random(0.02, 0.05);
    }
    
    resetColor() {
      // 扩展颜色选项：青色、蓝色、绿色、亮黄色、紫色
      const colorOptions = [
        p.color(0, 255, 255),   // 青色
        p.color(0, 150, 255),   // 蓝色
        p.color(57, 255, 20),   // 绿色
        p.color(255, 255, 0),   // 亮黄色
        p.color(180, 60, 255)   // 紫色
      ];
      this.color = colorOptions[Math.floor(p.random(colorOptions.length))];
      
      // 亮度模式下降低透明度
      if (isLightMode) {
        this.alpha = p.random(120, 180);
        this.strokeAlpha = p.random(30, 60);
      } else {
        this.alpha = p.random(150, 220);
        this.strokeAlpha = p.random(40, 80);
      }
    }
    
    update() {
      // 简单平滑的运动
      this.pos.add(this.vel);
      
      // 缓慢改变速度方向
      if (p.frameCount % 60 === 0) {
        this.vel.rotate(p.random(-0.1, 0.1));
      }
      
      // 更新脉冲状态
      this.pulsePhase += this.pulseSpeed;
      
      // 边界反弹
      if (this.pos.x < 0 || this.pos.x > p.width) {
        this.vel.x *= -1;
      }
      if (this.pos.y < 0 || this.pos.y > p.height) {
        this.vel.y *= -1;
      }
    }
    
    display() {
      // 脉冲效果 - 大小微妙地变化
      const pulseFactor = 0.2 * Math.sin(this.pulsePhase) + 1;
      const currentSize = this.size * pulseFactor;
      
      // 发光效果
      p.noStroke();
      p.fill(this.color, this.alpha * 0.3);
      p.circle(this.pos.x, this.pos.y, currentSize * 2);
      
      // 主要粒子
      p.fill(this.color, this.alpha);
      p.circle(this.pos.x, this.pos.y, currentSize);
    }
  }
  
  // 流星效果的鼠标跟随
  class MinimalMouseEffect {
    constructor() {
      this.meteorTrail = [];
      this.maxTrailLength = 25; // 更长的轨迹
      this.meteorParticles = []; // 流星碎片粒子
      this.lastX = 0;
      this.lastY = 0;
      this.isMoving = false;
      this.movementTimer = 0;
    }
    
    addPoint(x, y) {
      // 检测实际移动
      const speedX = x - this.lastX;
      const speedY = y - this.lastY;
      const speed = Math.sqrt(speedX * speedX + speedY * speedY);
      
      // 只有当鼠标实际移动时才添加点
      if (speed > 2) {
        this.isMoving = true;
        this.movementTimer = 5; // 设置移动状态持续帧数
        
        // 添加到流星轨迹
        this.meteorTrail.push({
          x: x,
          y: y,
          alpha: 255,
          size: Math.min(8, 3 + speed * 0.2), // 根据速度调整大小
          speedX: speedX * 0.2,
          speedY: speedY * 0.2
        });
        
        // 保持轨迹长度
        if (this.meteorTrail.length > this.maxTrailLength) {
          this.meteorTrail.shift();
        }
        
        // 根据移动速度生成粒子
        if (speed > 3) {
          // 添加流星碎片
          for (let i = 0; i < 3; i++) {
            this.meteorParticles.push({
              x: x + p.random(-10, 10),
              y: y + p.random(-10, 10),
              speedX: p.random(-1, 1) + speedX * 0.1,
              speedY: p.random(-1, 1) + speedY * 0.1,
              size: p.random(1, 4),
              alpha: p.random(150, 255),
              life: p.random(20, 50)
            });
          }
        }
      } else {
        // 递减移动计时器
        if (this.movementTimer > 0) {
          this.movementTimer--;
        } else {
          this.isMoving = false;
        }
      }
      
      this.lastX = x;
      this.lastY = y;
    }
    
    update() {
      // 更新流星轨迹 - 如果鼠标停止，更快地淡出
      const fadeRate = this.isMoving ? 0.90 : 0.80;
      
      for (let point of this.meteorTrail) {
        point.alpha *= fadeRate; // 鼠标停止时更快淡出
        
        // 只有当鼠标移动时才添加拖尾效果
        if (this.isMoving) {
          point.x += point.speedX * 0.5;
          point.y += point.speedY * 0.5;
        }
      }
      
      // 删除完全透明的点
      this.meteorTrail = this.meteorTrail.filter(point => point.alpha > 5);
      
      // 更新流星碎片
      for (let i = this.meteorParticles.length - 1; i >= 0; i--) {
        const particle = this.meteorParticles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.alpha -= 255 / particle.life;
        particle.size *= 0.97;
        
        if (particle.alpha <= 0 || particle.size < 0.5) {
          this.meteorParticles.splice(i, 1);
        }
      }
    }
    
    display() {
      // 使用荧光绿色作为流星颜色
      const meteorColor = p.color(57, 255, 20); // 荧光绿
      
      // 显示流星轨迹
      if (this.meteorTrail.length > 1) {
        p.noFill();
        
        // 轨迹线
        p.beginShape();
        for (let i = 0; i < this.meteorTrail.length; i++) {
          const point = this.meteorTrail[i];
          const alpha = point.alpha * (i / this.meteorTrail.length); // 渐变透明度
          p.strokeWeight(point.size * (i / this.meteorTrail.length * 0.8 + 0.2));
          p.stroke(meteorColor, alpha);
          p.vertex(point.x, point.y);
        }
        p.endShape();
        
        // 发光效果
        for (let i = this.meteorTrail.length - 5; i < this.meteorTrail.length; i++) {
          if (i >= 0) {
            const point = this.meteorTrail[i];
            p.noStroke();
            p.fill(meteorColor, point.alpha * 0.3);
            p.circle(point.x, point.y, point.size * 3);
            p.fill(meteorColor, point.alpha * 0.7);
            p.circle(point.x, point.y, point.size);
          }
        }
      }
      
      // 显示流星碎片
      for (let particle of this.meteorParticles) {
        p.noStroke();
        p.fill(meteorColor, particle.alpha * 0.7);
        p.circle(particle.x, particle.y, particle.size);
        
        // 发光效果
        p.fill(meteorColor, particle.alpha * 0.3);
        p.circle(particle.x, particle.y, particle.size * 2);
      }
    }
  }
};

// 创建P5.js实例
new p5(sketch, 'p5-container');

// 极简但炫酷的卡片悬停效果
document.addEventListener('DOMContentLoaded', function() {
  const workCards = document.querySelectorAll('.work-card');
  
  workCards.forEach(card => {
    // 添加鼠标进入事件
    card.addEventListener('mouseenter', function() {
      // 获取当前主题模式
      const isLightMode = document.body.classList.contains('light-mode');
      const type = this.getAttribute('data-type');
      
      // 简单优雅的转换效果
      this.style.transform = 'translateY(-8px)';
      this.style.transition = 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
      
      // 针对不同类型的卡片使用不同的边框颜色
      if (type === 'whitelist') {
        this.style.borderColor = 'var(--secondary-color, #B56BFF)';
      } else if (type === 'image' || type === 'ai') {
        this.style.borderColor = 'var(--primary-color, #00F7FF)';
      } else if (type === 'book') {
        this.style.borderColor = 'var(--secondary-color, #B56BFF)';
      } else if (type === 'video') {
        this.style.borderColor = 'var(--accent-color, #FF6B35)';
      }
      
      // 增加边框宽度
      this.style.borderWidth = '2px';
      
      // 简约的阴影效果
      if (isLightMode) {
        this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
      } else {
        this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
      }
    });
    
    // 添加鼠标离开事件
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.borderWidth = '1px';
      this.style.borderColor = 'var(--card-border)';
      this.style.boxShadow = 'none';
    });
  });
});