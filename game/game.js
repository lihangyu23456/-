// 游戏状态
let gameState = {
    currentScreen: 'start',
    backgroundImage: null, // 自定义背景图片
    hitAudio: null, // 自定义击中音效
    shockwaveInterval: null, // 冲击波定时器
    shockwaveVideoPlaying: null, // 哪个玩家的冲击波视频正在播放
    player1: {
        name: '玩家1',
        avatar: null,
        character: null,
        health: 100,
        maxHealth: 100,
        x: 100,
        y: 0,
        vx: 0,
        vy: 0,
        facing: 'right',
        state: 'idle',
        isBlocking: false,
        isCrouching: false,
        isAttacking: false,
        attackCooldown: 0,
        combo: 0,
        comboTimer: 0,
        isJumping: false,
        isFrozen: false, // 是否被冻结（视频播放时）
        cooldowns: {
            lightAttack: 0,
            heavyAttack: 0,
            specialAttack: 0,
            hadouken: 0,
            dragonPunch: 0,
            shockwave: 0,
            goldenShield: 0
        },
        skillType: 'energy-ball', // 默认技能类型
        skillImage: null, // 自定义技能图片
        shockwaveVideo: null, // 冲击波前摇视频
        isInvincible: false, // 是否处于无敌状态
        invincibleTimer: 0, // 无敌计时器
        // 动画相关
        animationFrame: 0, // 当前动画帧
        animationTimer: 0, // 动画计时器
        prevX: 100, // 上一帧的X位置（用于计算移动）
        lastState: 'idle', // 上一帧的状态
        moveDirection: 0, // 移动方向：-1左，0静止，1右
        // 动画帧缓存（每个状态的多帧图片）
        animationFrames: {
            idle: null, // 待机帧
            walk: [], // 行走帧数组
            jump: null, // 跳跃帧
            attack: [], // 攻击帧数组
            block: null // 防御帧
        },
        // AI生成配置
        aiAnimationEnabled: false, // 是否启用AI动画生成
        huggingFaceToken: null // HuggingFace API Token
    },
    player2: {
        name: '玩家2',
        avatar: null,
        character: null,
        health: 100,
        maxHealth: 100,
        x: 700,
        y: 0,
        vx: 0,
        vy: 0,
        facing: 'left',
        state: 'idle',
        isBlocking: false,
        isCrouching: false,
        isAttacking: false,
        attackCooldown: 0,
        combo: 0,
        comboTimer: 0,
        isJumping: false,
        isFrozen: false, // 是否被冻结（视频播放时）
        cooldowns: {
            lightAttack: 0,
            heavyAttack: 0,
            specialAttack: 0,
            hadouken: 0,
            dragonPunch: 0,
            shockwave: 0,
            goldenShield: 0
        },
        skillType: 'fire-ball', // 默认技能类型
        skillImage: null, // 自定义技能图片
        shockwaveVideo: null, // 冲击波前摇视频
        isInvincible: false, // 是否处于无敌状态
        invincibleTimer: 0, // 无敌计时器
        // 动画相关
        animationFrame: 0, // 当前动画帧
        animationTimer: 0, // 动画计时器
        prevX: 700, // 上一帧的X位置（用于计算移动）
        lastState: 'idle', // 上一帧的状态
        moveDirection: 0, // 移动方向：-1左，0静止，1右
        // 动画帧缓存（每个状态的多帧图片）
        animationFrames: {
            idle: null, // 待机帧
            walk: [], // 行走帧数组
            jump: null, // 跳跃帧
            attack: [], // 攻击帧数组
            block: null // 防御帧
        },
        // AI生成配置
        aiAnimationEnabled: false, // 是否启用AI动画生成
        huggingFaceToken: null // HuggingFace API Token
    },
    timer: 99,
    isPaused: false,
    gameLoop: null,
    timerInterval: null,
    keys: {},
    projectiles: [],
    obstacles: [],
    platforms: [],
    shockwaveProjectiles: [] // 冲击波投射物数组
};

// 预设角色（拳皇风格）
const characters = [
    { id: 1, emoji: '😎', name: '酷盖', style: '速度型', skillType: 'energy-ball', skillSpeed: 12 },
    { id: 2, emoji: '🤖', name: '机器人', style: '力量型', skillType: 'rock', skillSpeed: 8 },
    { id: 3, emoji: '🦊', name: '狐狸', style: '技巧型', skillType: 'wind-blade', skillSpeed: 15 },
    { id: 4, emoji: '🐼', name: '熊猫', style: '防御型', skillType: 'ice-shard', skillSpeed: 10 },
    { id: 5, emoji: '🦄', name: '独角兽', style: '魔法型', skillType: 'energy-ball', skillSpeed: 14 },
    { id: 6, emoji: '🐯', name: '老虎', style: '力量型', skillType: 'fire-ball', skillSpeed: 9 },
    { id: 7, emoji: '🦸', name: '超人', style: '平衡型', skillType: 'lightning', skillSpeed: 11 },
    { id: 8, emoji: '🧛', name: '吸血鬼', style: '速度型', skillType: 'wind-blade', skillSpeed: 16 },
    { id: 9, emoji: '👻', name: '幽灵', style: '技巧型', skillType: 'ice-shard', skillSpeed: 13 }
];

// 技能配置
const skillConfigs = {
    'energy-ball': { emoji: '🔵', speed: 12, size: 50, class: 'energy-ball' },
    'fire-ball': { emoji: '🔥', speed: 9, size: 60, class: 'fire-ball' },
    'ice-shard': { emoji: '❄️', speed: 10, size: 40, class: 'ice-shard' },
    'wind-blade': { emoji: '💨', speed: 15, size: 80, class: 'wind-blade' },
    'lightning': { emoji: '⚡', speed: 11, size: 100, class: 'lightning' },
    'rock': { emoji: '🪨', speed: 8, size: 70, class: 'rock' }
};

// 搞笑表情
const funnyEmojis = ['💥', '🤕', '😱', '🤣', '😵', '🤪', '😭', '🤯', '🤬', '🥴', '🔥', '⚡', '💨', '🎯', '🎉'];

// 物理常量（使用Object.freeze防止被意外修改）
const PHYSICS_CONSTANTS = Object.freeze({
    GRAVITY: -0.255,
    JUMP_FORCE: 13,
    MOVE_SPEED: 2,
    FRICTION: 0.85,
    GROUND_Y: 0
});

// 直接使用冻结对象的引用，确保始终使用锁定值
const GRAVITY = () => PHYSICS_CONSTANTS.GRAVITY;
const JUMP_FORCE = () => PHYSICS_CONSTANTS.JUMP_FORCE;
const MOVE_SPEED = () => PHYSICS_CONSTANTS.MOVE_SPEED;
const FRICTION = () => PHYSICS_CONSTANTS.FRICTION;
const GROUND_Y = () => PHYSICS_CONSTANTS.GROUND_Y;

// 初始化
function init() {
    renderCharacterOptions();
    setupControls();
}

// 强制执行物理常量
function enforcePhysicsConstants() {
    // 物理常量已使用 Object.freeze 锁定，const 声明也保证不可修改
    // 此函数仅在游戏开始时调用，确认物理系统正常
    console.log('Physics constants enforced:', {
        GRAVITY: GRAVITY(),
        JUMP_FORCE: JUMP_FORCE(),
        MOVE_SPEED: MOVE_SPEED(),
        FRICTION: FRICTION(),
        GROUND_Y: GROUND_Y()
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 渲染角色选项
function renderCharacterOptions() {
    const grid1 = document.getElementById('player1-characters');
    const grid2 = document.getElementById('player2-characters');

    characters.forEach((char, index) => {
        const option1 = createCharacterOption(char, 1, index);
        const option2 = createCharacterOption(char, 2, index);
        grid1.appendChild(option1);
        grid2.appendChild(option2);
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

function createCharacterOption(char, player, index) {
    const div = document.createElement('div');
    div.className = 'character-option';
    div.textContent = char.emoji;
    div.title = `${char.name} - ${char.style}`;
    div.onclick = () => selectCharacter(player, char, div, index);
    return div;
}

// 选择角色
function selectCharacter(player, character, element, index) {
    const grid = document.getElementById(`player${player}-characters`);
    const options = grid.querySelectorAll('.character-option');

    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    gameState[`player${player}`].character = character;
    gameState[`player${player}`].skillType = character.skillType;
}

// 上传头像
function uploadAvatar(player, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 立即读取复选框状态，不依赖延迟
            const cropCheckbox = document.getElementById(`player${player}-auto-crop`);
            const autoCropEnabled = cropCheckbox ? cropCheckbox.checked : true;

            console.log(`=== uploadAvatar 玩家${player} ===`);
            console.log('cropCheckbox元素:', cropCheckbox);
            console.log('cropCheckbox.checked:', cropCheckbox ? cropCheckbox.checked : '元素不存在');
            console.log('autoCropEnabled:', autoCropEnabled);

            if (autoCropEnabled) {
                // 启用抠图（根据设置选择本地算法或AI）
                processAvatarImage(e.target.result, player);
            } else {
                // 直接使用原始图像
                gameState[`player${player}`].avatar = e.target.result;
                const avatarContainer = document.getElementById(`player${player}-avatar`);
                avatarContainer.innerHTML = `<img src="${e.target.result}" alt="头像">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// 处理上传的人物图像 - 改进算法（人物主体检测）
function processAvatarImageWithAlgorithm(imageSrc, player) {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 设置目标尺寸
            const targetSize = 256;
            canvas.width = targetSize;
            canvas.height = targetSize;

            // 第一步：将图像绘制到临时画布进行抠图处理
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;

            // 绘制原始图像
            tempCtx.drawImage(img, 0, 0);

            // 获取图像像素数据
            const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            const width = img.width;
            const height = img.height;

            console.log('开始改进算法抠图...');

            // === 改进的算法：基于人物主体检测 ===

            // 1. 检测边缘像素，确定可能的背景色
            const borderPixels = [];
            const borderSize = Math.max(5, Math.floor(Math.min(width, height) * 0.08));

            // 采样边缘像素（上下左右四个边缘）
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < borderSize; y++) {
                    borderPixels.push((y * width + x) * 4); // 上边缘
                    borderPixels.push(((height - 1 - y) * width + x) * 4); // 下边缘
                }
            }
            for (let y = borderSize; y < height - borderSize; y++) {
                for (let x = 0; x < borderSize; x++) {
                    borderPixels.push((y * width + x) * 4); // 左边缘
                    borderPixels.push((y * width + (width - 1 - x)) * 4); // 右边缘
                }
            }

            // 统计边缘颜色频率
            const bgColorMap = {};
            for (const idx of borderPixels) {
                const r = Math.floor(data[idx] / 16) * 16;
                const g = Math.floor(data[idx + 1] / 16) * 16;
                const b = Math.floor(data[idx + 2] / 16) * 16;
                const key = `${r},${g},${b}`;
                bgColorMap[key] = (bgColorMap[key] || 0) + 1;
            }

            // 找出最频繁的背景色
            let maxBgFreq = 0;
            let bgColor = [255, 255, 255];
            for (const [key, freq] of Object.entries(bgColorMap)) {
                if (freq > maxBgFreq) {
                    maxBgFreq = freq;
                    bgColor = key.split(',').map(Number);
                }
            }

            console.log('检测到的背景色:', bgColor);

            // 2. 创建前景遮罩（用于标记人物像素）
            const foregroundMask = new Uint8Array(width * height);

            // 3. 从图像中心向外的种子填充算法，检测人物主体
            // 假设人物在图像中心区域
            const centerX = Math.floor(width / 2);
            const centerY = Math.floor(height / 2);
            const centerRadius = Math.min(width, height) * 0.15; // 中心区域半径

            // 采样中心区域，获取人物的颜色范围
            const centerPixels = [];
            for (let y = centerY - centerRadius; y < centerY + centerRadius; y++) {
                for (let x = centerX - centerRadius; x < centerX + centerRadius; x++) {
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const idx = (y * width + x) * 4;
                        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        if (data[idx + 3] > 100 && brightness > 30 && brightness < 225) {
                            centerPixels.push([data[idx], data[idx + 1], data[idx + 2]]);
                        }
                    }
                }
            }

            // 计算中心区域的平均颜色作为人物参考色
            let personColorSum = [0, 0, 0];
            if (centerPixels.length > 0) {
                for (const pixel of centerPixels) {
                    personColorSum[0] += pixel[0];
                    personColorSum[1] += pixel[1];
                    personColorSum[2] += pixel[2];
                }
                const personColor = personColorSum.map(s => s / centerPixels.length);
                console.log('检测到的人物参考色:', personColor);

                // 4. 基于颜色距离判断像素是否属于人物
                const bgThreshold = 35; // 背景颜色阈值
                const personThreshold = 60; // 人物颜色阈值

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];
                    const pixelIdx = i / 4;

                    // 计算与背景色的距离
                    const bgDist = Math.sqrt(
                        Math.pow(r - bgColor[0], 2) +
                        Math.pow(g - bgColor[1], 2) +
                        Math.pow(b - bgColor[2], 2)
                    );

                    // 计算与人物色的距离
                    const personDist = Math.sqrt(
                        Math.pow(r - personColor[0], 2) +
                        Math.pow(g - personColor[1], 2) +
                        Math.pow(b - personColor[2], 2)
                    );

                    // 判断像素类型
                    if (a > 50) {
                        // 如果接近背景色，设为透明
                        if (bgDist < bgThreshold) {
                            data[i + 3] = 0;
                        }
                        // 如果接近人物色，保留并可能增强
                        else if (personDist < personThreshold || bgDist > bgThreshold * 1.5) {
                            foregroundMask[pixelIdx] = 1;
                        }
                        // 边界区域使用渐变
                        else {
                            const edgeFactor = (bgDist - bgThreshold) / (personThreshold - bgThreshold);
                            data[i + 3] = Math.floor(data[i + 3] * Math.max(0, edgeFactor));
                        }
                    }
                }

                // 5. 形态学操作：去除噪点
                const maskCopy = new Uint8Array(foregroundMask);
                const iterations = 2;

                for (let iter = 0; iter < iterations; iter++) {
                    for (let y = 1; y < height - 1; y++) {
                        for (let x = 1; x < width - 1; x++) {
                            const idx = y * width + x;
                            // 统计周围8个像素
                            let count = 0;
                            for (let dy = -1; dy <= 1; dy++) {
                                for (let dx = -1; dx <= 1; dx++) {
                                    if (maskCopy[idx + dy * width + dx] === 1) count++;
                                }
                            }
                            // 如果周围前景像素多，则当前像素也设为前景
                            if (count >= 5) foregroundMask[idx] = 1;
                        }
                    }
                }

                // 6. 应用遮罩：将非前景的边缘区域设为透明
                const edgeDistance = Math.max(3, Math.floor(Math.min(width, height) * 0.03));
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const distToEdge = Math.min(x, width - 1 - x, y, height - 1 - y);
                        const idx = (y * width + x) * 4;

                        // 边缘区域检查
                        if (distToEdge < edgeDistance) {
                            const bgDist = Math.sqrt(
                                Math.pow(data[idx] - bgColor[0], 2) +
                                Math.pow(data[idx + 1] - bgColor[1], 2) +
                                Math.pow(data[idx + 2] - bgColor[2], 2)
                            );
                            if (bgDist < bgThreshold * 2 && foregroundMask[y * width + x] === 0) {
                                data[idx + 3] = 0;
                            }
                        }
                    }
                }
            } else {
                // 如果中心区域没有有效像素，使用简单背景去除
                const simpleThreshold = 30;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    const dist = Math.sqrt(
                        Math.pow(r - bgColor[0], 2) +
                        Math.pow(g - bgColor[1], 2) +
                        Math.pow(b - bgColor[2], 2)
                    );

                    if (dist < simpleThreshold && a > 50) {
                        data[i + 3] = Math.floor((dist / simpleThreshold) * a);
                    }
                }
            }

            // 将处理后的图像数据放回临时画布
            tempCtx.putImageData(imageData, 0, 0);

            // 缩放到目标尺寸
            const scale = Math.min(targetSize / img.width, targetSize / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            const offsetX = (targetSize - scaledWidth) / 2;
            const offsetY = (targetSize - scaledHeight) / 2;

            ctx.clearRect(0, 0, targetSize, targetSize);
            ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);

            // 添加阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
            ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);

            const processedImage = canvas.toDataURL('image/png');
            console.log('改进算法抠图完成');

            gameState[`player${player}`].avatar = processedImage;
            const avatarContainer = document.getElementById(`player${player}-avatar`);
            avatarContainer.innerHTML = `<img src="${processedImage}" alt="头像">`;

            // 自动生成动画帧
            generateAnimationFrames(processedImage, player);

        } catch (error) {
            console.error('改进算法处理失败:', error);
            gameState[`player${player}`].avatar = imageSrc;
            const avatarContainer = document.getElementById(`player${player}-avatar`);
            avatarContainer.innerHTML = `<img src="${imageSrc}" alt="头像">`;
        }
    };

    img.onerror = function() {
        console.error('图像加载失败');
        gameState[`player${player}`].avatar = imageSrc;
        const avatarContainer = document.getElementById(`player${player}-avatar`);
        avatarContainer.innerHTML = `<img src="${imageSrc}" alt="头像">`;
    };

    img.src = imageSrc;
}

// 使用AI抠图服务（需要联网）
async function processAvatarImageWithAI(imageSrc, player) {
    try {
        console.log('开始AI抠图...');

        // 方案1: 使用 removebg.com API (需要API密钥)
        // 首先尝试使用免费API
        let processedImage = null;

        // 将base64转换为Blob
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image_file', blob);

        // 尝试调用removebg API
        try {
            const apiResponse = await fetch('https://api.removebg.com/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': 'dcFyjH2VdbZUKUPRUiRedyJ2', // 已配置API密钥
                },
                body: formData
            });

            if (apiResponse.ok) {
                const blobResult = await apiResponse.blob();
                processedImage = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(blobResult);
                });
                console.log('removebg API抠图成功');
            } else {
                throw new Error('API响应失败');
            }
        } catch (apiError) {
            console.warn('AI API调用失败，尝试备用方案:', apiError);

            // 方案2: 使用公开的AI抠图服务（备用方案）
            // 注意：这里使用一个公开的演示API，实际使用时需要替换为稳定的API
            try {
                const formData2 = new FormData();
                formData2.append('file', blob);

                const backupResponse = await fetch('https://background-removal-production.up.railway.app/remove', {
                    method: 'POST',
                    body: formData2
                });

                if (backupResponse.ok) {
                    const blobResult = await backupResponse.blob();
                    processedImage = await new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(blobResult);
                    });
                    console.log('备用AI服务抠图成功');
                } else {
                    throw new Error('备用API也失败了');
                }
            } catch (backupError) {
                console.error('所有AI服务都失败:', backupError);
                processedImage = null;
            }
        }

        if (processedImage) {
            // 缩放图像到目标尺寸
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const targetSize = 256;
            canvas.width = targetSize;
            canvas.height = targetSize;

            const img = new Image();
            img.onload = function() {
                const scale = Math.min(targetSize / img.width, targetSize / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;

                const offsetX = (targetSize - scaledWidth) / 2;
                const offsetY = (targetSize - scaledHeight) / 2;

                ctx.clearRect(0, 0, targetSize, targetSize);
                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

                // 添加阴影
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 8;
                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

                const finalImage = canvas.toDataURL('image/png');
                gameState[`player${player}`].avatar = finalImage;
                const avatarContainer = document.getElementById(`player${player}-avatar`);
                avatarContainer.innerHTML = `<img src="${finalImage}" alt="头像">`;

                // 自动生成动画帧
                generateAnimationFrames(finalImage, player);
            };
            img.src = processedImage;
        } else {
            throw new Error('AI抠图未返回结果');
        }

    } catch (error) {
        console.warn('AI抠图失败，回退到本地算法:', error);
        alert('AI抠图服务暂时不可用，已切换到本地算法。如需使用AI抠图，请确保网络连接正常并获取API密钥。');
        // AI失败时回退到本地算法
        processAvatarImageWithAlgorithm(imageSrc, player);
    }
}

// 主处理函数 - 根据设置选择算法
function processAvatarImage(imageSrc, player) {
    // 立即读取AI复选框状态，不依赖延迟
    const aiCheckbox = document.getElementById(`player${player}-use-ai`);
    const useAI = aiCheckbox ? aiCheckbox.checked : false;

    console.log(`=== processAvatarImage 玩家${player} ===`);
    console.log('aiCheckbox元素:', aiCheckbox);
    console.log('aiCheckbox.checked:', aiCheckbox ? aiCheckbox.checked : '元素不存在');
    console.log('useAI:', useAI);

    if (useAI) {
        // 使用AI抠图（需要联网）
        console.log('使用AI抠图服务');
        processAvatarImageWithAI(imageSrc, player);
    } else {
        // 使用本地改进算法
        console.log('使用本地算法');
        processAvatarImageWithAlgorithm(imageSrc, player);
    }
}

// ==================== 动画系统 ====================

// 程序化生成动画帧（基于关节动画）
function generateAnimationFrames(avatarSrc, player) {
    console.log('开始生成关节动画帧...');

    const playerData = gameState[`player${player}`];

    // 预生成行走帧（6帧循环）
    const walkFrames = [];
    for (let i = 0; i < 6; i++) {
        walkFrames.push(createWalkFrame(avatarSrc, i));
    }

    // 预生成攻击帧（4帧）
    const attackFrames = [];
    for (let i = 0; i < 4; i++) {
        attackFrames.push(createAttackFrame(avatarSrc, i));
    }

    // 保存到动画帧
    playerData.animationFrames = {
        idle: null, // 实时生成（呼吸效果）
        walk: walkFrames,
        jump: createJumpFrame(avatarSrc),
        attack: attackFrames,
        block: createBlockFrame(avatarSrc)
    };

    console.log('关节动画帧生成完成！');
}

// ==================== AI 动画生成（阿里云通义万相） ====================

// 使用阿里云 API 生成动画帧（图生图风格匹配）
async function generateAnimationFramesWithAI(avatarSrc, player, apiKey) {
    console.log('开始使用阿里云通义万问生成动画帧...');

    try {
        const playerData = gameState[`player${player}`];

        // 定义要生成的动作提示词（更详细，描述具体动作）
        const actions = [
            {
                name: 'idle',
                prompt: '角色站立姿势，身体保持平衡，轻微的呼吸感，简洁背景，高质量动画帧，2D扁平风格'
            },
            {
                name: 'walk',
                frames: [
                    '角色行走第1帧，左腿向前迈出，右臂向前摆动，简洁背景，高质量动画帧',
                    '角色行走第2帧，双脚着地，身体重心居中，简洁背景，高质量动画帧',
                    '角色行走第3帧，右腿向前迈出，左臂向前摆动，简洁背景，高质量动画帧',
                    '角色行走第4帧，双脚着地，身体重心居中，简洁背景，高质量动画帧',
                    '角色行走第5帧，左腿向前迈出，右臂向前摆动，简洁背景，高质量动画帧',
                    '角色行走第6帧，双脚着地，身体重心居中，简洁背景，高质量动画帧'
                ]
            },
            {
                name: 'jump',
                prompt: '角色跳跃姿势，身体腾空，双腿向后弯曲，双臂向前抬起，简洁背景，高质量动画帧，动态感'
            },
            {
                name: 'attack',
                frames: [
                    '角色攻击第1帧，身体后缩，蓄力姿态，简洁背景，高质量动画帧',
                    '角色攻击第2帧，身体前倾，右臂开始向前伸展，简洁背景，高质量动画帧',
                    '角色攻击第3帧，右臂完全前伸，拳头向前，身体最大前倾，简洁背景，高质量动画帧',
                    '角色攻击第4帧，保持攻击姿态，最大伸展，简洁背景，高质量动画帧'
                ]
            },
            {
                name: 'block',
                prompt: '角色防御姿势，双臂交叉在胸前，身体微向后倾，简洁背景，高质量动画帧，防御姿态'
            }
        ];

        // 为每个动作生成帧
        for (const action of actions) {
            const frames = [];

            if (action.frames) {
                // 多帧动作（行走、攻击）
                for (let i = 0; i < action.frames.length; i++) {
                    console.log(`正在生成 ${action.name} 第 ${i + 1} 帧...`);

                    const generatedImage = await callAliyunAPI(
                        action.frames[i],
                        apiKey
                    );

                    if (generatedImage) {
                        frames.push(generatedImage);
                        console.log(`${action.name} 第 ${i + 1} 帧生成成功`);
                    } else {
                        console.warn(`${action.name} 第 ${i + 1} 帧生成失败`);
                    }

                    // 避免API限流，延迟1000ms
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                // 单帧动作（待机、跳跃、防御）
                console.log(`正在生成 ${action.name} 帧...`);

                const generatedImage = await callAliyunAPI(
                    action.prompt,
                    apiKey
                );

                if (generatedImage) {
                    frames.push(generatedImage);
                    console.log(`${action.name} 帧生成成功`);
                } else {
                    console.warn(`${action.name} 帧生成失败`);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // 保存到动画帧
            if (action.name === 'idle') {
                playerData.animationFrames.idle = frames[0];
            } else {
                playerData.animationFrames[action.name] = frames;
            }

            console.log(`${action.name} 帧生成完成`);
        }

        console.log('AI动画帧全部生成完成！');

    } catch (error) {
        console.error('AI动画生成失败:', error);
        alert('AI动画生成失败，已切换到程序化动画。\n错误信息：' + error.message);
        // 回退到程序化动画
        generateAnimationFrames(avatarSrc, player);
    }
}

// 创建呼吸效果帧（待机动画）
function createBreathingFrame(imageSrc, phase) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.src = imageSrc;

    ctx.save();

    // 计算缩放比例（呼吸效果：0.98 ~ 1.02）
    const scale = 1 + Math.sin(phase) * 0.02;

    // 居中绘制
    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);
    ctx.translate(-size / 2, -size / 2);

    ctx.drawImage(img, 0, 0, size, size);

    ctx.restore();

    return canvas.toDataURL('image/png');
}

// 创建行走帧
function createWalkFrame(imageSrc, frameIndex) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.src = imageSrc;

    ctx.save();

    // 行走：上下摆动 + 轻微旋转
    const bounce = Math.sin(frameIndex * Math.PI / 3) * 5; // 上下5px
    const rotation = Math.sin(frameIndex * Math.PI / 3) * 0.05; // 左右微转

    ctx.translate(size / 2, size / 2 - bounce);
    ctx.rotate(rotation);
    ctx.translate(-size / 2, -size / 2);

    ctx.drawImage(img, 0, 0, size, size);

    ctx.restore();

    return canvas.toDataURL('image/png');
}

// 创建跳跃帧
function createJumpFrame(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.src = imageSrc;

    ctx.save();

    // 跳跃：拉伸变高
    ctx.translate(size / 2, size / 2);
    ctx.scale(0.9, 1.1); // 压扁拉长
    ctx.translate(-size / 2, -size / 2);

    ctx.drawImage(img, 0, 0, size, size);

    ctx.restore();

    return canvas.toDataURL('image/png');
}

// ==================== 关节动画系统 ====================

// 部位定义
const BODY_PARTS = {
    HEAD: { startY: 0, height: 0.25 },
    TORSO: { startY: 0.25, height: 0.35 },
    LEFT_ARM: { startY: 0.25, height: 0.35, side: 'left' },
    RIGHT_ARM: { startY: 0.25, height: 0.35, side: 'right' },
    LEFT_LEG: { startY: 0.6, height: 0.4, side: 'left' },
    RIGHT_LEG: { startY: 0.6, height: 0.4, side: 'right' }
};

// 提取身体部位
function extractBodyPart(imageSrc, part, direction = 'front') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.src = imageSrc;

    ctx.drawImage(img, 0, 0, size, size);

    const startY = Math.floor(part.startY * size);
    const partHeight = Math.floor(part.height * size);

    // 部位分割
    let sourceX = 0, sourceY = startY, sourceW = size, sourceH = partHeight;

    if (part.side === 'left') {
        sourceX = 0;
        sourceW = size * 0.5;
    } else if (part.side === 'right') {
        sourceX = size * 0.5;
        sourceW = size * 0.5;
    }

    const partCanvas = document.createElement('canvas');
    const partCtx = partCanvas.getContext('2d');
    partCanvas.width = sourceW;
    partCanvas.height = sourceH;

    partCtx.drawImage(canvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

    return partCanvas.toDataURL('image/png');
}

// 创建待机帧（呼吸 + 轻微晃动）
function createBreathingFrame(imageSrc, phase) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const breathe = 1 + Math.sin(phase) * 0.02;
    const sway = Math.sin(phase * 0.5) * 2;

    ctx.save();
    ctx.translate(size / 2, size / 2 + sway);
    ctx.scale(breathe, breathe);
    ctx.translate(-size / 2, -size / 2);

    const img = new Image();
    img.src = imageSrc;
    ctx.drawImage(img, 0, 0, size, size);

    ctx.restore();
    return canvas.toDataURL('image/png');
}

// 创建行走帧（腿部摆动）
function createWalkFrame(imageSrc, frameIndex) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const bounce = Math.sin(frameIndex * Math.PI / 3) * 5;
    const leftLegAngle = Math.sin(frameIndex * Math.PI / 3) * 0.3;
    const rightLegAngle = Math.sin(frameIndex * Math.PI / 3 + Math.PI) * 0.3;
    const leftArmAngle = Math.sin(frameIndex * Math.PI / 3 + Math.PI) * 0.2;
    const rightArmAngle = Math.sin(frameIndex * Math.PI / 3) * 0.2;

    // 绘制顺序：左腿→右腿→躯干→左臂→右臂→头
    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_LEG, leftLegAngle, size, size / 2 + bounce);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_LEG, rightLegAngle, size, size / 2 + bounce);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.TORSO, 0, size, size / 2 + bounce);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_ARM, leftArmAngle, size, size / 2 + bounce);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_ARM, rightArmAngle, size, size / 2 + bounce);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.HEAD, 0, size, size / 2 + bounce);

    return canvas.toDataURL('image/png');
}

// 创建跳跃帧（腿部弯曲）
function createJumpFrame(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // 跳跃时双腿向后弯曲
    const leftLegAngle = -0.4;
    const rightLegAngle = -0.4;
    const stretch = 1.05;

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(stretch, 1 / stretch);
    ctx.translate(-size / 2, -size / 2);

    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_LEG, leftLegAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_LEG, rightLegAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.TORSO, 0, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_ARM, -0.3, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_ARM, -0.3, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.HEAD, 0, size, 0);

    ctx.restore();
    return canvas.toDataURL('image/png');
}

// 创建攻击帧（手臂前伸，躯干前倾）
function createAttackFrame(imageSrc, frameIndex) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    const progress = Math.min(frameIndex / 4, 1);

    // 攻击动作：右臂前伸，躯干前倾
    const rightArmAngle = -progress * 0.8;
    const leftArmAngle = progress * 0.3;
    const torsoAngle = progress * 0.2;
    const lunge = progress * 30;
    const scale = 1 + progress * 0.15;

    ctx.save();
    ctx.translate(size / 2 + lunge, size / 2);
    ctx.scale(scale, scale);
    ctx.translate(-size / 2, -size / 2);

    // 发光效果
    if (progress > 0.3) {
        ctx.shadowColor = `rgba(255, 200, 0, ${progress * 0.5})`;
        ctx.shadowBlur = progress * 40;
    }

    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_LEG, 0, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_LEG, 0, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.TORSO, torsoAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_ARM, leftArmAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_ARM, rightArmAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.HEAD, torsoAngle * 0.5, size, 0);

    ctx.restore();
    return canvas.toDataURL('image/png');
}

// 创建防御帧（护臂防御姿态）
function createBlockFrame(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // 防御姿态：双臂交叉
    const leftArmAngle = 0.8;
    const rightArmAngle = -0.8;
    const torsoAngle = -0.1;

    ctx.save();
    ctx.globalAlpha = 0.7;

    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_LEG, 0, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_LEG, 0, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.TORSO, torsoAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.LEFT_ARM, leftArmAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.RIGHT_ARM, rightArmAngle, size, 0);
    drawBodyPart(ctx, imageSrc, BODY_PARTS.HEAD, 0, size, 0);

    // 绘制盾牌效果
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(size / 2 + 30, size / 2 - 20, 70, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
    ctx.fill();

    ctx.restore();
    return canvas.toDataURL('image/png');
}

// 绘制单个身体部位（带旋转）
function drawBodyPart(ctx, imageSrc, part, angle, size, offsetY) {
    const startY = Math.floor(part.startY * size);
    const partHeight = Math.floor(part.height * size);

    let sourceX = 0, sourceW = size;

    if (part.side === 'left') {
        sourceX = 0;
        sourceW = size * 0.5;
    } else if (part.side === 'right') {
        sourceX = size * 0.5;
        sourceW = size * 0.5;
    }

    ctx.save();

    // 设置旋转中心（部位底部）
    const pivotY = startY + partHeight;
    ctx.translate(sourceX + sourceW / 2, pivotY + offsetY);
    ctx.rotate(angle);
    ctx.translate(-(sourceX + sourceW / 2), -pivotY - offsetY);

    const img = new Image();
    img.src = imageSrc;
    ctx.drawImage(img, sourceX, startY, sourceW, partHeight, sourceX, startY + offsetY, sourceW, partHeight);

    ctx.restore();
}

// 更新动画（每帧调用）
function updateAnimation(player) {
    const playerData = gameState[`player${player}`];
    const fighterImg = document.getElementById(`fighter${player}-img`);

    // 确定当前状态
    let currentState = 'idle';
    if (playerData.isAttacking) {
        currentState = 'attacking';
    } else if (playerData.isJumping) {
        currentState = 'jumping';
    } else if (playerData.isBlocking) {
        currentState = 'blocking';
    } else if (Math.abs(playerData.vx) > 0.1) {
        currentState = 'moving';
    }

    // 状态改变时重置动画
    if (currentState !== playerData.lastState) {
        playerData.animationFrame = 0;
        playerData.animationTimer = 0;
        playerData.lastState = currentState;
    }

    // 如果没有生成动画帧，使用实时程序化动画
    if (!fighterImg || !playerData.animationFrames.idle) {
        updateRealtimeAnimation(player, currentState);
        return;
    }

    // 使用预生成的动画帧
    playerData.animationTimer++;

    let currentFrame = playerData.animationFrames.idle;
    const animationSpeed = 6; // 动画速度（每6帧切换一次）

    switch (currentState) {
        case 'idle':
            // 待机：轻微呼吸（实时生成以实现流畅效果）
            const breathePhase = (playerData.animationTimer / 60) * Math.PI * 2;
            currentFrame = createBreathingFrame(playerData.avatar, breathePhase);
            break;

        case 'moving':
            // 行走：循环摆动
            const walkIndex = Math.floor((playerData.animationTimer / animationSpeed) % 6);
            currentFrame = playerData.animationFrames.walk[walkIndex] || playerData.animationFrames.idle;
            break;

        case 'jumping':
            // 跳跃：拉伸帧
            currentFrame = playerData.animationFrames.jump;
            break;

        case 'attacking':
            // 攻击：连续帧
            const attackIndex = Math.min(
                Math.floor(playerData.animationTimer / animationSpeed),
                playerData.animationFrames.attack.length - 1
            );
            currentFrame = playerData.animationFrames.attack[attackIndex] || playerData.animationFrames.idle;

            // 攻击动画结束
            if (attackIndex >= playerData.animationFrames.attack.length - 1) {
                playerData.isAttacking = false;
            }
            break;

        case 'blocking':
            // 防御：防御帧
            currentFrame = playerData.animationFrames.block;
            break;

        default:
            currentFrame = playerData.animationFrames.idle;
    }

    // 更新图像
    fighterImg.src = currentFrame;
}

// 实时程序化动画（备用方案）
function updateRealtimeAnimation(player, currentState) {
    const fighterImg = document.getElementById(`fighter${player}-img`);

    if (!fighterImg) return;

    // 基础动画
    const transform = [];
    const filters = [];

    // 添加阴影
    transform.push('translateY(-50%)');

    switch (currentState) {
        case 'idle':
            // 待机：轻微缩放（呼吸效果）
            const breathe = 1 + Math.sin(Date.now() / 500) * 0.02;
            transform.push(`scale(${breathe})`);
            break;

        case 'moving':
            // 行走：上下摆动
            const bounce = Math.sin(Date.now() / 150) * 3;
            transform.push(`translateY(${-50 + bounce}%)`);
            break;

        case 'jumping':
            // 跳跃：拉伸
            transform.push('scale(0.95, 1.05)');
            break;

        case 'attacking':
            // 攻击：放大 + 发光
            const attackProgress = (Date.now() % 300) / 300;
            const scale = 1 + attackProgress * 0.1;
            transform.push(`scale(${scale})`);
            filters.push(`drop-shadow(0 0 ${attackProgress * 20}px rgba(255, 200, 0, ${attackProgress})`);
            break;

        case 'blocking':
            // 防御：半透明
            filters.push('opacity(0.7)');
            break;
    }

    // 应用变换
    fighterImg.style.transform = transform.join(' ');
    fighterImg.style.filter = filters.join(' ');
}

// ==================== AI动画生成（HuggingFace API） ====================

// 使用阿里云API生成动画帧
async function generateAnimationFramesWithAI(avatarSrc, player, apiKey) {
    console.log('开始使用阿里云通义千问生成动画帧...');

    try {
        const playerData = gameState[`player${player}`];

        // 定义要生成的动作提示词（中文）
        const actions = [
            { name: 'idle', prompt: '卡通角色站立姿势，轻微呼吸，中性姿态，简洁背景，高质量' },
            { name: 'walk', prompt: '卡通角色行走动画，腿部移动，动态姿势，简洁背景，高质量' },
            { name: 'jump', prompt: '卡通角色跳跃姿势，身体拉伸，动态动作，简洁背景，高质量' },
            { name: 'attack', prompt: '卡通角色攻击姿势，向前冲拳，动态动作，简洁背景，高质量' },
            { name: 'block', prompt: '卡通角色防御姿势，护盾防御，简洁背景，高质量' }
        ];

        // 为每个动作生成3帧
        for (const action of actions) {
            const frames = [];

            for (let i = 0; i < 3; i++) {
                console.log(`正在生成 ${action.name} 第 ${i + 1} 帧...`);

                const generatedImage = await callAliyunAPI(
                    action.prompt,
                    apiKey
                );

                if (generatedImage) {
                    frames.push(generatedImage);
                    console.log(`${action.name} 第 ${i + 1} 帧生成成功`);
                } else {
                    console.warn(`${action.name} 第 ${i + 1} 帧生成失败`);
                }

                // 避免API限流，延迟1000ms
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // 保存到动画帧
            if (action.name === 'idle') {
                playerData.animationFrames.idle = frames[0];
            } else {
                playerData.animationFrames[action.name] = frames;
            }

            console.log(`${action.name} 帧生成完成`);
        }

        console.log('AI动画帧全部生成完成！');

    } catch (error) {
        console.error('AI动画生成失败:', error);
        alert('AI动画生成失败，已切换到程序化动画。\n错误信息：' + error.message);
        // 回退到程序化动画
        generateAnimationFrames(avatarSrc, player);
    }
}

// 调用阿里云通义千问图像生成 API
async function callAliyunAPI(prompt, apiKey) {
    try {
        // 阿里云通义万相 API 端点
        const response = await fetch(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'wanx-v1',
                    input: {
                        prompt: prompt
                    },
                    parameters: {
                        size: '512*512',
                        n: 1,
                        seed: Math.floor(Math.random() * 1000000)
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API请求失败: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();

        // 阿里云返回格式: { output: { results: [{ url: "..." }] } }
        if (result.output && result.output.results && result.output.results.length > 0) {
            const imageUrl = result.output.results[0].url;

            // 下载图片并转换为 base64
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();

            return await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(blob);
            });
        } else {
            throw new Error('API返回格式错误');
        }

    } catch (error) {
        console.error('阿里云API调用失败:', error);
        return null;
    }
}

// 设置阿里云 API Key
function setAliyunApiKey(player, apiKey) {
    gameState[`player${player}`].huggingFaceToken = apiKey; // 复用存储字段
    gameState[`player${player}`].aiAnimationEnabled = true;
    console.log(`玩家${player} 阿里云API Key已设置`);
}

// 生成玩家动画（主入口）
function generatePlayerAnimation(player) {
    const playerData = gameState[`player${player}`];

    if (!playerData.avatar) {
        console.warn('玩家头像不存在，无法生成动画');
        return;
    }

    if (playerData.aiAnimationEnabled && playerData.huggingFaceToken) {
        // 使用AI生成
        generateAnimationFramesWithAI(playerData.avatar, player, playerData.huggingFaceToken);
    } else {
        // 使用程序化生成
        generateAnimationFrames(playerData.avatar, player);
    }
}

// UI函数：生成动画
function generateProceduralAnimation(player) {
    const apiKeyInput = document.getElementById(`player${player}-hf-token`);
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

    const playerData = gameState[`player${player}`];

    if (!playerData.avatar) {
        alert('请先上传头像！');
        return;
    }

    if (!apiKey) {
        // 使用程序化动画（关节动画）
        console.log('使用程序化动画（关节动画）...');
        generateAnimationFrames(playerData.avatar, player);
        alert('程序化动画帧已生成！\n人物会在游戏中动起来。');
    } else {
        // 使用 AI 动画生成
        console.log('使用 AI 动画生成...');

        // 显示加载提示
        const btn = document.activeElement;
        if (btn) {
            btn.textContent = '生成中...';
            btn.disabled = true;
        }

        generateAnimationFramesWithAI(playerData.avatar, player, apiKey).then(() => {
            if (btn) {
                btn.textContent = '生成动画帧';
                btn.disabled = false;
            }
            alert('AI 动画帧生成完成！');
        }).catch((error) => {
            if (btn) {
                btn.textContent = '生成动画帧';
                btn.disabled = false;
            }
            alert('AI 动画生成失败：' + error.message);
        });
    }
}


// 上传技能图片
function uploadSkillImage(player, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 仅更新技能图片，不影响任何游戏物理参数
            gameState[`player${player}`].skillImage = e.target.result;
            const previewContainer = document.getElementById(`player${player}-skill-preview`);
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="技能预览" class="skill-preview-img">`;
        };
        reader.readAsDataURL(file);
    }
}

// 上传背景图片
function uploadBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 仅更新背景图片，不影响任何游戏物理参数
            gameState.backgroundImage = e.target.result;
            const previewContainer = document.getElementById('background-preview');
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="背景预览" class="background-preview-img">`;
        };
        reader.readAsDataURL(file);
    }
}

// 上传击中音效
function uploadHitAudio(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 保存音频数据
            gameState.hitAudio = e.target.result;

            // 更新UI显示
            const audioInfo = document.getElementById('audio-info');
            audioInfo.innerHTML = `
                <span class="audio-uploaded">✅</span>
                <span class="audio-text">${file.name}</span>
            `;

            // 创建并播放测试音频
            const testAudio = new Audio(e.target.result);
            testAudio.play().catch(err => {
                console.log('音频需要用户交互才能播放');
            });
        };
        reader.readAsDataURL(file);
    }
}

// 上传冲击波前摇视频
function uploadShockwaveVideo(player, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 保存视频数据
            gameState[`player${player}`].shockwaveVideo = e.target.result;

            // 更新UI显示
            const previewContainer = document.getElementById(`player${player}-video-preview`);
            const videoElement = document.createElement('video');
            videoElement.src = e.target.result;
            videoElement.className = 'video-preview-element';
            videoElement.muted = true;
            videoElement.playsInline = true;
            previewContainer.innerHTML = '';
            previewContainer.appendChild(videoElement);
        };
        reader.readAsDataURL(file);
    }
}

// 播放击中音效
function playHitSound() {
    if (gameState.hitAudio) {
        // 创建新的Audio实例以确保可以多次播放
        const audio = new Audio(gameState.hitAudio);
        audio.currentTime = 0;
        
        // 播放音频
        audio.play().catch(error => {
            console.log('音频播放失败:', error);
        });
        
        // 音频播放完后自动清理
        audio.addEventListener('ended', () => {
            audio.remove();
        });
    }
}

// 显示角色选择界面
function showCharacterSelect() {
    hideAllScreens();
    document.getElementById('character-select-screen').classList.remove('hidden');
    gameState.currentScreen = 'character-select';
}

// 开始游戏
function startGame() {
    // 强制重置物理常量
    enforcePhysicsConstants();

    // 获取玩家名称
    gameState.player1.name = document.getElementById('player1-name').value || '玩家1';
    gameState.player2.name = document.getElementById('player2-name').value || '玩家2';

    // 检查是否选择了角色
    if (!gameState.player1.character || !gameState.player2.character) {
        alert('请双方都选择一个角色！');
        return;
    }

    // 如果没有上传头像，使用默认角色
    if (!gameState.player1.avatar) {
        gameState.player1.avatar = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50%" font-size="50">${gameState.player1.character.emoji}</text></svg>`)}`;
    }
    if (!gameState.player2.avatar) {
        gameState.player2.avatar = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50%" font-size="50">${gameState.player2.character.emoji}</text></svg>`)}`;
    }

    // 设置游戏界面
    document.getElementById('game-player1-name').textContent = gameState.player1.name;
    document.getElementById('game-player2-name').textContent = gameState.player2.name;
    document.getElementById('game-player1-avatar').src = gameState.player1.avatar;
    document.getElementById('game-player2-avatar').src = gameState.player2.avatar;
    document.getElementById('fighter1-img').src = gameState.player1.avatar;
    document.getElementById('fighter2-img').src = gameState.player2.avatar;

    // 设置背景图片
    const battleArena = document.getElementById('battle-arena');
    if (gameState.backgroundImage) {
        battleArena.style.backgroundImage = `url(${gameState.backgroundImage})`;
        battleArena.style.backgroundSize = 'cover';
        battleArena.style.backgroundPosition = 'center';
    } else {
        battleArena.style.backgroundImage = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)';
        battleArena.style.backgroundSize = '';
        battleArena.style.backgroundPosition = '';
    }

    // 重置游戏状态
    resetGame();

    hideAllScreens();
    document.getElementById('game-screen').classList.remove('hidden');
    gameState.currentScreen = 'game';

    // 开始游戏循环
    startGameLoop();
}

// 重置游戏状态
function resetGame() {
    gameState.player1.health = 100;
    gameState.player1.maxHealth = 100;
    gameState.player1.x = 150;
    gameState.player1.y = 0;
    gameState.player1.vx = 0;
    gameState.player1.vy = 0;
    gameState.player1.facing = 'right';
    gameState.player1.state = 'idle';
    gameState.player1.isBlocking = false;
    gameState.player1.isCrouching = false;
    gameState.player1.isAttacking = false;
    gameState.player1.isJumping = false;
    gameState.player1.isFrozen = false;
    gameState.player1.isInvincible = false;
    gameState.player1.invincibleTimer = 0;
    gameState.player1.combo = 0;
    gameState.player1.cooldowns = {
        lightAttack: 0,
        heavyAttack: 0,
        specialAttack: 0,
        hadouken: 0,
        dragonPunch: 0,
        shockwave: 0,
        goldenShield: 0
    };
    gameState.player1.skillType = gameState.player1.character?.skillType || 'energy-ball';
    gameState.player1.animationFrame = 0;
    gameState.player1.animationTimer = 0;
    gameState.player1.prevX = 150;
    gameState.player1.lastState = 'idle';
    gameState.player1.moveDirection = 0;

    gameState.player2.health = 100;
    gameState.player2.maxHealth = 100;
    gameState.player2.x = 1450;
    gameState.player2.y = 0;
    gameState.player2.vx = 0;
    gameState.player2.vy = 0;
    gameState.player2.facing = 'left';
    gameState.player2.state = 'idle';
    gameState.player2.isBlocking = false;
    gameState.player2.isCrouching = false;
    gameState.player2.isAttacking = false;
    gameState.player2.isJumping = false;
    gameState.player2.isFrozen = false;
    gameState.player2.isInvincible = false;
    gameState.player2.invincibleTimer = 0;
    gameState.player2.combo = 0;
    gameState.player2.cooldowns = {
        lightAttack: 0,
        heavyAttack: 0,
        specialAttack: 0,
        hadouken: 0,
        dragonPunch: 0,
        shockwave: 0,
        goldenShield: 0
    };
    gameState.player2.skillType = gameState.player2.character?.skillType || 'fire-ball';
    gameState.player2.animationFrame = 0;
    gameState.player2.animationTimer = 0;
    gameState.player2.prevX = 1450;
    gameState.player2.lastState = 'idle';
    gameState.player2.moveDirection = 0;

    gameState.timer = 99;
    gameState.isPaused = false;
    gameState.shockwaveVideoPlaying = null;
    gameState.projectiles = [];
    gameState.shockwaveProjectiles = []; // 清空冲击波投射物

    // 清除冲击波定时器，防止游戏结束后继续生成
    if (gameState.shockwaveInterval) {
        clearInterval(gameState.shockwaveInterval);
        gameState.shockwaveInterval = null;
    }

    // 停止并隐藏冲击波视频
    const shockwaveVideo = document.getElementById('shockwave-video');
    shockwaveVideo.pause();
    shockwaveVideo.classList.add('hidden');

    // 清除旧建筑物
    gameState.obstacles.forEach(obs => {
        if (obs.element) obs.element.remove();
    });
    gameState.platforms.forEach(plat => {
        if (plat.element) plat.element.remove();
    });
    gameState.obstacles = [];
    gameState.platforms = [];

    // 清除背景
    const bgLayer = document.querySelector('.background-layer');
    if (bgLayer) bgLayer.remove();

    // 清除所有技能特效DOM元素
    const skillEffects = document.getElementById('skill-effects');
    if (skillEffects) {
        skillEffects.innerHTML = '';
    }

    // 生成背景和平台
    generateBackground();
    generatePlatforms();

    updateHealthBars();
    updateFighterStates();
}

// 设置控制
function setupControls() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 开始游戏循环
function startGameLoop() {
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timer--;
            document.getElementById('timer').textContent = gameState.timer;

            if (gameState.timer <= 0) {
                endGame();
            }
        }
    }, 1000);

    // 游戏主循环
    gameLoop();
}

    function gameLoop() {
        if (gameState.currentScreen === 'game' && !gameState.isPaused) {
            handleInput();
            updatePhysics();
            updateProjectiles();
            updateShockwaveProjectiles(); // 更新冲击波投射物
            updateCooldowns();
            updateInvincibleStatus();
            updateFighterPositions();
            updateFighterStates();
        }

        requestAnimationFrame(gameLoop);
    }

// 处理输入
function handleInput() {
    const p1 = gameState.player1;
    const p2 = gameState.player2;

    // 玩家1控制（如果被冻结则无法操作）
    if (!p1.isFrozen) {
        if (gameState.keys['a'] || gameState.keys['A']) {
            p1.vx = -MOVE_SPEED();
            p1.facing = 'left';
        } else if (gameState.keys['d'] || gameState.keys['D']) {
            p1.vx = MOVE_SPEED();
            p1.facing = 'right';
        } else {
            p1.vx *= FRICTION();
        }

        if (gameState.keys['s'] || gameState.keys['S']) {
            if (!p1.isAttacking) {
                p1.isCrouching = true;
                p1.isBlocking = true;
            }
        } else {
            p1.isCrouching = false;
            p1.isBlocking = false;
        }

        if ((gameState.keys['w'] || gameState.keys['W']) && !p1.isAttacking && !p1.isJumping) {
            // 检查玩家是否在某个平台上或地面上
            let onPlatform = false;

            // 检查是否在地面
            if (Math.abs(p1.y - GROUND_Y()) < 2) {
                onPlatform = true;
            }

            // 检查是否在某个平台上
            if (!onPlatform) {
                gameState.platforms.forEach(plat => {
                    if (p1.x >= plat.x - 30 && p1.x <= plat.x + plat.width + 30) {
                        if (Math.abs(p1.y - plat.y) < 2) {
                            onPlatform = true;
                        }
                    }
                });
            }

            if (onPlatform) {
                p1.vy = JUMP_FORCE();
                p1.isJumping = true;
                jump(1);
            }
        }

        // 玩家1攻击
        if (gameState.keys['i'] || gameState.keys['I']) {
            performAttack(1, 'light');
        }
        if (gameState.keys['o'] || gameState.keys['O']) {
            performAttack(1, 'heavy');
        }
        if (gameState.keys['p'] || gameState.keys['P']) {
            performAttack(1, 'shockwave');
        }
        if (gameState.keys['u'] || gameState.keys['U']) {
            performAttack(1, 'hadouken');
        }
        if (gameState.keys['l'] || gameState.keys['L']) {
            performAttack(1, 'goldenShield');
        }
        if (gameState.keys['k'] || gameState.keys['K']) {
            performAttack(1, 'dragonPunch');
        }
    }

    // 玩家2控制（如果被冻结则无法操作）
    if (!p2.isFrozen) {
        if (gameState.keys['ArrowLeft']) {
            p2.vx = -MOVE_SPEED();
            p2.facing = 'left';
        } else if (gameState.keys['ArrowRight']) {
            p2.vx = MOVE_SPEED();
            p2.facing = 'right';
        } else {
            p2.vx *= FRICTION();
        }

        if (gameState.keys['ArrowDown']) {
            if (!p2.isAttacking) {
                p2.isCrouching = true;
                p2.isBlocking = true;
            }
        } else {
            p2.isCrouching = false;
            p2.isBlocking = false;
        }

        if (gameState.keys['ArrowUp'] && !p2.isAttacking && !p2.isJumping) {
            // 检查玩家是否在某个平台上或地面上
            let onPlatform = false;

            // 检查是否在地面
            if (Math.abs(p2.y - GROUND_Y()) < 2) {
                onPlatform = true;
            }

            // 检查是否在某个平台上
            if (!onPlatform) {
                gameState.platforms.forEach(plat => {
                    if (p2.x >= plat.x - 30 && p2.x <= plat.x + plat.width + 30) {
                        if (Math.abs(p2.y - plat.y) < 2) {
                            onPlatform = true;
                        }
                    }
                });
            }

            if (onPlatform) {
                p2.vy = JUMP_FORCE();
                p2.isJumping = true;
                jump(2);
            }
        }

        // 玩家2攻击
        if (gameState.keys['1']) {
            performAttack(2, 'light');
        }
        if (gameState.keys['4']) {
            performAttack(2, 'shockwave');
        }
        if (gameState.keys['5']) {
            performAttack(2, 'goldenShield');
        }
        if (gameState.keys['6']) {
            performAttack(2, 'special');
        }
        if (gameState.keys['3']) {
            performAttack(2, 'hadouken');
        }
        if (gameState.keys['2']) {
            performAttack(2, 'dragonPunch');
        }
    }
}

// 更新物理
function updatePhysics() {
    [gameState.player1, gameState.player2].forEach(player => {
        // 应用重力
        player.vy += GRAVITY();

        // 更新位置
        player.x += player.vx;
        player.y += player.vy;

        // 平台碰撞检测 - 实体平台
        let landedOnPlatform = false;
        gameState.platforms.forEach(plat => {
            // 水平检测：玩家是否在平台范围内（加上玩家宽度的一半）
            const playerLeft = player.x - 30;
            const playerRight = player.x + 30;
            const horizontalOverlap = playerLeft < plat.x + plat.width && playerRight > plat.x;
            
            // 垂直检测：从上方落到平台
            const playerBottom = player.y;
            const prevPlayerBottom = player.y - player.vy; // 上一帧的底部位置
            
            // 检测是否从上方穿过平台表面
            if (horizontalOverlap) {
                // 如果上一帧在平台上方，这一帧在平台表面或穿过
                if (prevPlayerBottom >= plat.y && playerBottom <= plat.y) {
                    player.y = plat.y;
                    player.vy = 0;
                    player.isJumping = false;
                    landedOnPlatform = true;
                }
                // 如果已经在平台上，确保不会掉下去
                else if (Math.abs(playerBottom - plat.y) < 2) {
                    player.y = plat.y;
                    player.vy = 0;
                    player.isJumping = false;
                    landedOnPlatform = true;
                }
            }
        });

        // 地面碰撞
        if (player.y < GROUND_Y()) {
            player.y = GROUND_Y();
            player.vy = 0;
            player.isJumping = false;
        }

        // 边界碰撞
        if (player.x < 50) player.x = 50;
        if (player.x > 1550) player.x = 1550;
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 更新投射物
function updateProjectiles() {
    gameState.projectiles = gameState.projectiles.filter(proj => {
        // 根据技能类型移动
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;

            // 更新范围指示器
            if (proj.rangeIndicator) {
                proj.rangeIndicator.style.left = `${proj.x}px`;
                proj.rangeIndicator.style.bottom = `${proj.y}px`;
            }

            // 更新轨迹
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 15) {
                proj.trail.shift();
            }
            updateTrail(proj);
        }

        // 检测与建筑物的碰撞
        let hitObstacle = false;
        for (let obs of gameState.obstacles) {
            if (obs.health > 0) {
                const distance = Math.abs(proj.x - obs.x);
                const heightDiff = Math.abs(proj.y - obs.y);
                if (distance < 50 && heightDiff < 100) {
                    obs.health -= proj.damage;
                    if (obs.element) {
                        obs.element.style.opacity = obs.health / obs.maxHealth;
                    }
                    if (obs.health <= 0) {
                        destroyObstacle(obs);
                    }
                    createSkillEffect(obs.x, obs.y, '💨');
                    hitObstacle = true;
                    break;
                }
            }
        }

        if (hitObstacle) {
            if (proj.element) {
                proj.element.remove();
            }
            if (proj.trailElement) {
                proj.trailElement.remove();
            }
            if (proj.rangeIndicator) {
                proj.rangeIndicator.remove();
            }
            return false;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 50; // 检查高度是否匹配（调整偏移量）

        // 跳跃时免疫技能伤害
        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            let finalDamage = proj.damage;

            // 检查防御
            if (target.isBlocking) {
                finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                createBlockEffect(target.x, target.y);
            }

            dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
            createSkillEffect(target.x, target.y, '💥');
            if (proj.element) {
                proj.element.remove();
            }
            if (proj.trailElement) {
                proj.trailElement.remove();
            }
            if (proj.rangeIndicator) {
                proj.rangeIndicator.remove();
            }
            return false;
        }

        // 检查是否超出边界
        if (proj.x < -100 || proj.x > 1600 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            if (proj.trailElement) {
                proj.trailElement.remove();
            }
            if (proj.rangeIndicator) {
                proj.rangeIndicator.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 更新冷却
function updateCooldowns() {
    [gameState.player1, gameState.player2].forEach((player, index) => {
        Object.keys(player.cooldowns).forEach(key => {
            if (player.cooldowns[key] > 0) {
                player.cooldowns[key]--;
            }
        });

        // 连击计时器
        if (player.comboTimer > 0) {
            player.comboTimer--;
            if (player.comboTimer <= 0) {
                player.combo = 0;
            }
        }

        // 更新冷却显示
        updateCooldownDisplay(index + 1, player);
    });
}

// 更新无敌状态
function updateInvincibleStatus() {
    [gameState.player1, gameState.player2].forEach((player, index) => {
        if (player.isInvincible) {
            player.invincibleTimer--;

            if (player.invincibleTimer <= 0) {
                // 无敌结束
                player.isInvincible = false;
                const fighter = document.getElementById(`fighter${index + 1}`);
                fighter.classList.remove('golden-shield');
            }
        }
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 更新冷却显示
function updateCooldownDisplay(player, playerData) {
    const cooldownElement = document.getElementById(`player${player}-cooldowns`);
    const cooldownElementMini = document.getElementById(`player${player}-cooldowns-mini`);

    const types = player === 1 ? ['lightAttack', 'heavyAttack', 'specialAttack', 'hadouken', 'goldenShield', 'dragonPunch', 'shockwave']
                           : ['lightAttack', 'shockwave', 'goldenShield', 'heavyAttack', 'specialAttack', 'hadouken', 'dragonPunch'];

    const skillKeys = player === 1 ? ['I', 'O', 'P', 'U', 'L', 'K', 'P'] : ['1', '4', '5', '6', '3', '2'];

    // 更新底部冷却显示
    if (cooldownElement) {
        const spans = cooldownElement.querySelectorAll('span');
        spans.forEach((span, index) => {
            const cooldownSpan = span.querySelector('.cooldown');
            if (cooldownSpan && types[index]) {
                const cooldown = playerData.cooldowns[types[index]];
                if (cooldown > 0) {
                    cooldownSpan.textContent = `${cooldown}`;
                    cooldownSpan.classList.remove('ready');
                    cooldownSpan.classList.add('waiting');
                } else {
                    cooldownSpan.textContent = '就绪';
                    cooldownSpan.classList.remove('waiting');
                    cooldownSpan.classList.add('ready');
                }
            }
        });
    }

    // 更新顶部迷你冷却显示
    if (cooldownElementMini) {
        const miniSpans = cooldownElementMini.querySelectorAll('.cooldown-mini');
        miniSpans.forEach((span, index) => {
            if (types[index]) {
                const cooldown = playerData.cooldowns[types[index]];
                if (cooldown > 0) {
                    span.classList.remove('ready');
                    span.classList.add('waiting');
                } else {
                    span.classList.remove('waiting');
                    span.classList.add('ready');
                }
            }
        });
    }
}

// 执行攻击
function performAttack(player, type) {
    const attacker = gameState[`player${player}`];
    const defender = gameState[`player${player === 1 ? 2 : 1}`];

    // 检查冷却
    if (attacker.cooldowns[type] > 0 || attacker.isAttacking) return;

    attacker.isAttacking = true;
    attacker.state = 'attacking';

    let damage = 0;
    let range = 100;
    let attackDuration = 300;
    let attackRangeRadius = 0;

    switch(type) {
        case 'light':
            damage = Math.floor(Math.random() * 4) + 5; // 5-8伤害
            attacker.cooldowns.lightAttack = 30; // 30帧冷却
            range = 130;
            attackRangeRadius = 130;
            break;
        case 'heavy':
            damage = Math.floor(Math.random() * 6) + 10; // 10-15伤害
            attacker.cooldowns.heavyAttack = 60; // 增加冷却
            attackDuration = 400;
            range = 150;
            attackRangeRadius = 150;
            break;
        case 'special':
            damage = Math.floor(Math.random() * 11) + 15; // 15-25伤害
            attacker.cooldowns.specialAttack = 120; // 增加冷却
            attackDuration = 500;
            range = 180;
            attackRangeRadius = 180;
            break;
        case 'hadouken':
            damage = Math.floor(Math.random() * 5) + 8; // 8-12伤害
            attacker.cooldowns.hadouken = 300; // 5秒冷却
            createProjectile(player, damage);
            attackDuration = 200;
            range = 1000; // 波动拳远程
            attackRangeRadius = 0;
            break;
        case 'dragonPunch':
            damage = Math.floor(Math.random() * 7) + 12; // 12-18伤害
            attacker.cooldowns.dragonPunch = 150; // 增加冷却
            attackDuration = 400;
            range = 140;
            attackRangeRadius = 140;
            break;
        case 'shockwave':
            damage = 0.1; // 每个小攻击0.1伤害
            attacker.cooldowns.shockwave = 1200; // 20秒冷却
            attackDuration = 100; // 快速攻击
            range = 400; // 地图四分之一范围
            attackRangeRadius = 0;

            // 播放前摇视频（如果存在）
            if (attacker.shockwaveVideo) {
                playShockwaveVideo(player, () => {
                    // 视频播放完毕后执行冲击波
                    createShockwave(player);
                });
            } else {
                // 没有视频直接释放冲击波
                createShockwave(player);
            }
            break;
        case 'goldenShield':
            // 无敌金身技能
            attacker.cooldowns.goldenShield = 1560; // 26秒冷却
            attackDuration = 100;

            // 激活无敌状态
            attacker.isInvincible = true;
            attacker.invincibleTimer = 480; // 8秒无敌

            // 添加金身效果
            const fighter = document.getElementById(`fighter${player}`);
            fighter.classList.add('golden-shield');

            // 创建金身特效
            createGoldenShieldEffect(attacker.x, attacker.y);
            break;
    }

    // 显示攻击范围（仅近战攻击）
    if (attackRangeRadius > 0 && type !== 'goldenShield') {
        showAttackRange(attacker.x, attacker.y, attackRangeRadius, attackDuration);
    }

    // 金身技能不添加攻击动画
    if (type !== 'goldenShield') {
        const fighter = document.getElementById(`fighter${player}`);
        fighter.classList.add('attack-animation');
    }

    // 近战攻击时向前移动（金身和波动拳除外）
    if (type !== 'hadouken' && type !== 'goldenShield' && attacker.y === 0) {
        const dashDistance = type === 'special' ? 40 : (type === 'heavy' ? 30 : 20);
        const direction = attacker.facing === 'right' ? 1 : -1;
        attacker.x += dashDistance * direction;
    }

    // 计算距离和方向（金身技能不需要）
    if (type !== 'goldenShield') {
        const distance = Math.abs(attacker.x - defender.x);
        const isFacingDefender = (attacker.facing === 'right' && defender.x > attacker.x) ||
                                 (attacker.facing === 'left' && defender.x < attacker.x);

        if (distance < range && isFacingDefender && type !== 'hadouken') {
        // 计算防御
        let finalDamage = damage;
        let blocked = false;

        // 跳跃时无法防御近战攻击
        if (defender.isBlocking && !defender.isJumping) {
            finalDamage = Math.floor(damage * 0.2); // 防御减少80%伤害
            blocked = true;
            createBlockEffect(defender.x, defender.y);
        }

        // 跳跃时免疫近战攻击
        if (!defender.isJumping) {
            dealDamage(player === 1 ? 2 : 1, finalDamage, !blocked);

            if (blocked) {
                createBlockEffect(defender.x, defender.y);
            } else {
                // 增加连击
                attacker.combo++;
                attacker.comboTimer = 120;
                updateComboDisplay(player, attacker.combo);
            }
        } else {
            // 跳跃躲避
            createSkillEffect(defender.x, defender.y, '💨');
        }
    }
    }

    // 金身技能不需要攻击状态重置
    if (type !== 'goldenShield') {
        setTimeout(() => {
            const fighter = document.getElementById(`fighter${player}`);
            fighter.classList.remove('attack-animation');
            attacker.isAttacking = false;
            attacker.state = 'idle';
        }, attackDuration);
    } else {
        // 金身技能立即结束攻击状态
        attacker.isAttacking = false;
        attacker.state = 'idle';
    }
}

// 创建投射物
function createProjectile(player, damage) {
    const attacker = gameState[`player${player}`];
    const skillType = attacker.skillType || 'energy-ball';
    const skillConfig = skillConfigs[skillType];

    // 创建投射物DOM元素
    const container = document.getElementById('skill-effects');
    const projectileEl = document.createElement('div');
    projectileEl.className = `projectile ${skillConfig.class}`;
    
    // 使用自定义技能图片或默认emoji
    if (attacker.skillImage) {
        projectileEl.innerHTML = `<img src="${attacker.skillImage}" class="custom-skill-img">`;
    } else {
        projectileEl.textContent = skillConfig.emoji;
    }
    
    projectileEl.style.left = `${attacker.x}px`;
    projectileEl.style.bottom = `${attacker.y + 60}px`;
    container.appendChild(projectileEl);

    // 创建轨迹容器
    const trailContainer = document.createElement('div');
    trailContainer.className = 'projectile-trail';
    container.appendChild(trailContainer);

    // 创建技能范围指示
    const rangeIndicator = document.createElement('div');
    rangeIndicator.className = 'skill-range-indicator';
    rangeIndicator.style.left = `${attacker.x}px`;
    rangeIndicator.style.bottom = `${attacker.y + 60}px`;
    container.appendChild(rangeIndicator);

    // 根据技能类型设置速度
    const vx = attacker.facing === 'right' ? skillConfig.speed : -skillConfig.speed;

    const projectile = {
        player: player,
        x: attacker.x + (attacker.facing === 'right' ? 60 : -60),
        y: attacker.y + 60,
        vx: vx,
        damage: damage,
        life: 200,
        element: projectileEl,
        skillType: skillType,
        trail: [],
        trailElement: trailContainer,
        rangeIndicator: rangeIndicator,
        traveled: 0
    };

    gameState.projectiles.push(projectile);
}

// 播放冲击波前摇视频
function playShockwaveVideo(player, onComplete) {
    const attacker = gameState[`player${player}`];
    const shockwaveVideo = document.getElementById('shockwave-video');

    // 设置视频源
    shockwaveVideo.src = attacker.shockwaveVideo;
    shockwaveVideo.classList.remove('hidden');

    // 冻结玩家
    attacker.isFrozen = true;
    gameState.shockwaveVideoPlaying = player;

    // 播放视频
    shockwaveVideo.play().then(() => {
        // 视频开始播放
    }).catch(err => {
        console.error('视频播放失败:', err);
        // 播放失败直接执行完成回调
        attacker.isFrozen = false;
        gameState.shockwaveVideoPlaying = null;
        shockwaveVideo.classList.add('hidden');
        if (onComplete) onComplete();
    });

    // 监听视频结束
    shockwaveVideo.onended = () => {
        attacker.isFrozen = false;
        gameState.shockwaveVideoPlaying = null;
        shockwaveVideo.classList.add('hidden');
        shockwaveVideo.onended = null;
        if (onComplete) onComplete();
    };

    // 监听视频错误
    shockwaveVideo.onerror = () => {
        console.error('视频加载错误');
        attacker.isFrozen = false;
        gameState.shockwaveVideoPlaying = null;
        shockwaveVideo.classList.add('hidden');
        if (onComplete) onComplete();
    };
}

// 创建冲击波（连续发射300个小攻击）
function createShockwave(player) {
    // 清除之前的冲击波定时器，避免重叠
    if (gameState.shockwaveInterval) {
        clearInterval(gameState.shockwaveInterval);
    }

    const attacker = gameState[`player${player}`];
    const skillConfig = skillConfigs[attacker.skillType || 'energy-ball'];
    // 速度增加两倍
    const vx = attacker.facing === 'right' ? skillConfig.speed * 2 : -skillConfig.speed * 2;

    // 连续发射300个小攻击，每5毫秒（约0.3帧）发射一个，频率提升三倍（从16ms→5ms）
    let count = 0;
    gameState.shockwaveInterval = setInterval(() => {
        if (count >= 300) {
            clearInterval(gameState.shockwaveInterval);
            gameState.shockwaveInterval = null;
            return;
        }

        const container = document.getElementById('skill-effects');
        const projectileEl = document.createElement('div');
        projectileEl.className = `projectile ${skillConfig.class} shockwave-projectile`;
        projectileEl.style.transform = 'scale(0.5)'; // 缩小一半

        // 使用自定义技能图片或默认emoji
        if (attacker.skillImage) {
            projectileEl.innerHTML = `<img src="${attacker.skillImage}" class="custom-skill-img">`;
        } else {
            projectileEl.textContent = skillConfig.emoji;
        }

        // 从玩家当前位置发射
        const startX = attacker.x + (attacker.facing === 'right' ? 60 : -60);
        projectileEl.style.left = `${startX}px`;
        projectileEl.style.bottom = `${attacker.y + 60 + Math.random() * 40}px`; // 稍微随机的高度
        container.appendChild(projectileEl);

        const projectile = {
            player: player,
            x: startX,
            y: attacker.y + 60 + Math.random() * 40,
            vx: vx,
            damage: 0.1, // 每个攻击0.1伤害
            life: 50, // 存活时间
            element: projectileEl,
            skillType: attacker.skillType,
            traveled: 0,
            isShockwave: true // 标记为冲击波投射物
        };

        gameState.shockwaveProjectiles.push(projectile);
        count++;
    }, 5); // 每5毫秒（约0.3帧）发射一个，频率提升三倍
}

// 更新轨迹
function updateTrail(proj) {
    if (!proj.trailElement) return;

    // 清除旧轨迹
    proj.trailElement.innerHTML = '';

    // 绘制新轨迹
    proj.trail.forEach((point, index) => {
        const trailDot = document.createElement('div');
        trailDot.className = 'trail-dot';
        trailDot.style.left = `${point.x}px`;
        trailDot.style.bottom = `${point.y}px`;
        trailDot.style.opacity = (index / proj.trail.length) * 0.5;

        // 根据技能类型设置轨迹颜色
        const colors = {
            'energy-ball': '#00f2fe',
            'fire-ball': '#ff6b6b',
            'ice-shard': '#a8edea',
            'wind-blade': 'rgba(255,255,255,0.5)',
            'lightning': '#ffd93d',
            'rock': '#667eea'
        };
        trailDot.style.background = colors[proj.skillType] || '#fff';
        trailDot.style.boxShadow = `0 0 10px ${colors[proj.skillType] || '#fff'}`;

        proj.trailElement.appendChild(trailDot);
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 造成伤害
function dealDamage(player, damage, canCombo = true) {
    const victim = gameState[`player${player}`];

    // 检查是否处于无敌状态
    if (victim.isInvincible) {
        // 无敌时播放闪避特效但不扣血
        createSkillEffect(victim.x, victim.y, '✨');
        return;
    }

    victim.health -= damage;
    if (victim.health < 0) {
        victim.health = 0;
    }

    // 播放击中音效
    playHitSound();

    updateHealthBars();
    showEffect(player, damage);

    const fighter = document.getElementById(`fighter${player}`);
    fighter.classList.add('hit-effect', 'hit-flash');

    setTimeout(() => {
        fighter.classList.remove('hit-effect', 'hit-flash');
    }, 300);

    // 检查是否结束
    if (victim.health <= 0) {
        setTimeout(() => endGame(), 500);
    }
}

// 跳跃
function jump(player) {
    const fighter = document.getElementById(`fighter${player}`);
    fighter.classList.remove('jump-animation');
    void fighter.offsetWidth; // 触发重绘
    fighter.classList.add('jump-animation');
}

// 更新战斗者位置
function updateFighterPositions() {
    const p1 = document.getElementById('fighter1');
    const p2 = document.getElementById('fighter2');

    p1.style.left = `${gameState.player1.x}px`;
    p1.style.bottom = `${gameState.player1.y}px`;
    p2.style.left = `${gameState.player2.x}px`;
    p2.style.bottom = `${gameState.player2.y}px`;

    // 更新血量数字
    document.getElementById('fighter1-health-number').textContent = Math.max(0, gameState.player1.health);
    document.getElementById('fighter2-health-number').textContent = Math.max(0, gameState.player2.health);
}

// 更新战斗者状态
function updateFighterStates() {
    const p1 = gameState.player1;
    const p2 = gameState.player2;

    const state1 = document.getElementById('fighter1-state');
    const state2 = document.getElementById('fighter2-state');

    state1.textContent = getStateText(p1);
    state2.textContent = getStateText(p2);

    // 更新动画（使用新的动画系统）
    updateAnimation(1);
    updateAnimation(2);

    // 创建移动拖尾效果
    if (Math.abs(p1.vx) > 1) createMotionTrail(p1, 'fighter1');
    if (Math.abs(p2.vx) > 1) createMotionTrail(p2, 'fighter2');
}

// 更新人物动画
function updateFighterAnimations(player, fighterId) {
    const fighter = document.getElementById(fighterId);
    const fighterImg = document.getElementById(`${fighterId}-img`);

    if (!fighter || !fighterImg) return;

    // 计算移动方向
    const deltaX = player.x - player.prevX;
    player.moveDirection = Math.abs(deltaX) > 0.1 ? Math.sign(deltaX) : 0;
    player.prevX = player.x;

    // 确定当前状态
    let currentState = 'idle';
    if (player.isAttacking) {
        currentState = 'attacking';
    } else if (player.isJumping) {
        currentState = 'jumping';
    } else if (player.isBlocking) {
        currentState = 'blocking';
    } else if (Math.abs(player.vx) > 0.1) {
        currentState = 'walking';
    }

    // 状态改变时重置动画
    if (currentState !== player.lastState) {
        player.animationFrame = 0;
        player.animationTimer = 0;
        player.lastState = currentState;
    }

    // 更新动画计时器
    player.animationTimer++;

    // 根据状态应用动画
    switch (currentState) {
        case 'walking':
            // 走路动画 - 每隔6帧切换一次
            if (player.animationTimer >= 6) {
                player.animationTimer = 0;
                player.animationFrame = (player.animationFrame + 1) % 4; // 4帧循环
            }
            applyWalkAnimation(fighterImg, player.animationFrame, player.facing);
            break;

        case 'jumping':
            // 跳跃动画
            applyJumpAnimation(fighterImg, player.facing);
            break;

        case 'attacking':
            // 攻击动画
            applyAttackAnimation(fighterImg, player.facing);
            break;

        case 'blocking':
            // 防御动画
            applyBlockAnimation(fighterImg, player.facing);
            break;

        default: // idle
            // 待机动画 - 呼吸效果
            if (player.animationTimer >= 20) {
                player.animationTimer = 0;
                player.animationFrame = (player.animationFrame + 1) % 2; // 2帧循环
            }
            applyIdleAnimation(fighterImg, player.animationFrame, player.facing);
            break;
    }
}

// 走路动画
function applyWalkAnimation(img, frame, facing) {
    // 使用CSS transform模拟走路时的身体摆动
    const bounce = frame % 2 === 0 ? 5 : -5;
    const tilt = frame % 4 < 2 ? 2 : -2;

    let transform = '';
    if (facing === 'left') {
        transform = `scaleX(-1) translateY(${bounce}px) rotate(${tilt}deg)`;
    } else {
        transform = `translateY(${bounce}px) rotate(${tilt}deg)`;
    }

    img.style.transform = transform;
}

// 跳跃动画
function applyJumpAnimation(img, facing) {
    // 跳跃时的身体姿态
    let transform = '';
    if (facing === 'left') {
        transform = `scaleX(-1) translateY(-10px) rotate(-15deg)`;
    } else {
        transform = `translateY(-10px) rotate(-15deg)`;
    }

    img.style.transform = transform;
}

// 攻击动画
function applyAttackAnimation(img, facing) {
    // 攻击时的冲刺效果
    let transform = '';
    const lunge = facing === 'right' ? 15 : -15;

    if (facing === 'left') {
        transform = `scaleX(-1) translateX(${lunge}px) scaleY(1.1)`;
    } else {
        transform = `translateX(${lunge}px) scaleY(1.1)`;
    }

    img.style.transform = transform;
}

// 防御动画
function applyBlockAnimation(img, facing) {
    // 防御时的下蹲姿态
    let transform = '';
    if (facing === 'left') {
        transform = `scaleX(-1) scaleY(0.8) translateY(10px)`;
    } else {
        transform = `scaleY(0.8) translateY(10px)`;
    }

    img.style.transform = transform;
}

// 待机动画
function applyIdleAnimation(img, frame, facing) {
    // 呼吸效果
    const breathe = frame === 0 ? 2 : -2;

    let transform = '';
    if (facing === 'left') {
        transform = `scaleX(-1) translateY(${breathe}px)`;
    } else {
        transform = `translateY(${breathe}px)`;
    }

    img.style.transform = transform;
}

// 创建移动拖尾效果
function createMotionTrail(player, fighterId) {
    // 限制拖尾产生频率
    if (Math.random() > 0.3) return;

    const container = document.getElementById('skill-effects');
    const trail = document.createElement('div');
    trail.className = 'motion-trail';

    // 使用玩家头像作为拖尾
    trail.innerHTML = `<img src="${player.avatar}" class="trail-image" style="opacity: 0.3;">`;
    trail.style.position = 'absolute';
    trail.style.left = `${player.x}px`;
    trail.style.bottom = `${player.y}px`;
    trail.style.width = '120px';
    trail.style.height = '140px';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '5';

    // 根据朝向设置
    if (player.facing === 'left') {
        trail.style.transform = 'scaleX(-1)';
    }

    container.appendChild(trail);

    // 动画结束后移除
    setTimeout(() => {
        trail.style.transition = 'all 0.3s ease-out';
        trail.style.opacity = '0';
        trail.style.transform = (player.facing === 'left' ? 'scaleX(-1) ' : '') + 'scale(0.8)';
        setTimeout(() => trail.remove(), 300);
    }, 50);
}

function getStateText(player) {
    if (player.isAttacking) return '攻击中';
    if (player.isBlocking) return '防御';
    if (player.isJumping) return '跳跃';
    if (Math.abs(player.vx) > 0.5) return '移动';
    return '站立';
}

// 更新血条
function updateHealthBars() {
    document.getElementById('player1-health-fill').style.width = `${gameState.player1.health}%`;
    document.getElementById('player2-health-fill').style.width = `${gameState.player2.health}%`;
}

// 更新连击显示
function updateComboDisplay(player, combo) {
    const display = document.getElementById(`combo-player${player}`);
    if (combo > 1) {
        display.textContent = `${combo} HIT!`;
        display.classList.add('active');
        setTimeout(() => display.classList.remove('active'), 300);
    }
}

// 显示伤害效果
function showEffect(player, damage) {
    const effectDiv = document.getElementById(`fighter${player}-effect`);
    const playerData = gameState[`player${player}`];

    // 创建新的伤害特效元素
    const container = document.getElementById('skill-effects');
    const hurtText = document.createElement('div');
    hurtText.className = 'hurt-text';
    hurtText.textContent = '哥哥我错了';
    hurtText.style.left = `${playerData.x}px`;
    hurtText.style.bottom = `${playerData.y + 150}px`;
    container.appendChild(hurtText);

    setTimeout(() => hurtText.remove(), 1000);

    const emoji = damage > 15 ? funnyEmojis[Math.floor(Math.random() * 3)] : funnyEmojis[Math.floor(Math.random() * 5)];
    effectDiv.textContent = emoji + `-${damage}`;
    effectDiv.style.animation = 'none';
    setTimeout(() => {
        effectDiv.style.animation = 'effectPop 0.5s ease forwards';
    }, 10);
}

// 创建技能效果
function createSkillEffect(x, y, emoji) {
    const container = document.getElementById('skill-effects');
    const effect = document.createElement('div');
    effect.className = 'skill-effect';
    effect.textContent = emoji;
    effect.style.left = `${x}px`;
    effect.style.bottom = `${y + 100}px`;
    container.appendChild(effect);

    setTimeout(() => effect.remove(), 600);
}

// 创建金身特效
function createGoldenShieldEffect(x, y) {
    const container = document.getElementById('skill-effects');
    const effect = document.createElement('div');
    effect.className = 'golden-shield-effect';
    effect.style.left = `${x}px`;
    effect.style.bottom = `${y + 100}px`;
    container.appendChild(effect);

    setTimeout(() => effect.remove(), 2000);
}

// 创建波动拳特效（升龙拳）
function createHadoukenEffect(x, y) {
    const container = document.getElementById('skill-effects');
    const effect = document.createElement('div');
    effect.className = 'dragon-punch-effect';
    effect.style.left = `${x + 15}px`;
    effect.style.bottom = `${y + 30}px`;
    container.appendChild(effect);

    setTimeout(() => effect.remove(), 600);
}

// 创建格挡特效
function createBlockEffect(x, y) {
    const container = document.getElementById('skill-effects');
    const effect = document.createElement('div');
    effect.className = 'block-particle';
    effect.textContent = '🛡️';
    effect.style.left = `${x}px`;
    effect.style.bottom = `${y + 80}px`;
    container.appendChild(effect);

    setTimeout(() => effect.remove(), 300);
}

// 显示攻击范围
function showAttackRange(x, y, radius, duration) {
    const indicator = document.getElementById('attack-range-indicator');
    indicator.style.display = 'block';
    indicator.style.left = `${x + 75}px`;
    indicator.style.bottom = `${y + 90}px`;
    indicator.style.width = `${radius * 2}px`;
    indicator.style.height = `${radius * 2}px`;
    indicator.classList.add('show');

    setTimeout(() => {
        indicator.classList.remove('show');
        indicator.style.display = 'none';
    }, duration);
}

// 生成背景
function generateBackground() {
    const container = document.getElementById('battle-arena');
    const bgLayer = document.createElement('div');
    bgLayer.className = 'background-layer';

    const bgBuildings = ['🏙️', '🌆', '🌃', '🌉', '🗼', '⛪', '🕌'];
    for (let i = 0; i < 8; i++) {
        const bg = document.createElement('div');
        bg.className = 'building-bg';
        bg.textContent = bgBuildings[Math.floor(Math.random() * bgBuildings.length)];
        bg.style.left = `${150 + i * 200}px`;
        bgLayer.appendChild(bg);
    }

    container.appendChild(bgLayer);
}

// 生成多层平台
function generatePlatforms() {
    const container = document.getElementById('skill-effects');

    // 地面平台（整个地面）
    const groundPlatform = document.createElement('div');
    groundPlatform.className = 'ground-platform';
    groundPlatform.style.left = '0px';
    groundPlatform.style.bottom = '0px';
    groundPlatform.style.width = '100%';
    groundPlatform.style.height = '15px';
    container.appendChild(groundPlatform);

    gameState.platforms.push({
        x: 0,
        y: 0,
        width: 2000,
        height: 15,
        element: groundPlatform
    });

    // 第一层平台（中间低层）
    const platform1 = document.createElement('div');
    platform1.className = 'ground-platform';
    platform1.style.left = '300px';
    platform1.style.bottom = '120px';
    platform1.style.width = '400px';
    platform1.style.height = '15px';
    container.appendChild(platform1);

    gameState.platforms.push({
        x: 300,
        y: 120,
        width: 400,
        height: 15,
        element: platform1
    });

    // 第二层平台（左侧中层）
    const platform2 = document.createElement('div');
    platform2.className = 'ground-platform';
    platform2.style.left = '80px';
    platform2.style.bottom = '220px';
    platform2.style.width = '280px';
    platform2.style.height = '15px';
    container.appendChild(platform2);

    gameState.platforms.push({
        x: 80,
        y: 220,
        width: 280,
        height: 15,
        element: platform2
    });

    // 第三层平台（右侧中层）
    const platform3 = document.createElement('div');
    platform3.className = 'ground-platform';
    platform3.style.left = '1100px';
    platform3.style.bottom = '220px';
    platform3.style.width = '280px';
    platform3.style.height = '15px';
    container.appendChild(platform3);

    gameState.platforms.push({
        x: 1100,
        y: 220,
        width: 280,
        height: 15,
        element: platform3
    });

    // 第四层平台（中间高层）
    const platform4 = document.createElement('div');
    platform4.className = 'ground-platform';
    platform4.style.left = '500px';
    platform4.style.bottom = '320px';
    platform4.style.width = '350px';
    platform4.style.height = '15px';
    container.appendChild(platform4);

    gameState.platforms.push({
        x: 500,
        y: 320,
        width: 350,
        height: 15,
        element: platform4
    });

    // 第五层平台（左侧高层）
    const platform5 = document.createElement('div');
    platform5.className = 'ground-platform';
    platform5.style.left = '150px';
    platform5.style.bottom = '420px';
    platform5.style.width = '250px';
    platform5.style.height = '15px';
    container.appendChild(platform5);

    gameState.platforms.push({
        x: 150,
        y: 420,
        width: 250,
        height: 15,
        element: platform5
    });

    // 第六层平台（右侧高层）
    const platform6 = document.createElement('div');
    platform6.className = 'ground-platform';
    platform6.style.left = '1050px';
    platform6.style.bottom = '420px';
    platform6.style.width = '250px';
    platform6.style.height = '15px';
    container.appendChild(platform6);

    gameState.platforms.push({
        x: 1050,
        y: 420,
        width: 250,
        height: 15,
        element: platform6
    });

    // 第七层平台（顶层中央）
    const platform7 = document.createElement('div');
    platform7.className = 'ground-platform';
    platform7.style.left = '600px';
    platform7.style.bottom = '520px';
    platform7.style.width = '200px';
    platform7.style.height = '15px';
    container.appendChild(platform7);

    gameState.platforms.push({
        x: 600,
        y: 520,
        width: 200,
        height: 15,
        element: platform7
    });

    // 生成少量可破坏的障碍物
    generateObstacles();
}

// 生成随机建筑物
function generateObstacles() {
    const container = document.getElementById('skill-effects');
    const obstacleTypes = ['📦', '🪨', '🛢️', '🪵'];

    for (let i = 0; i < 2; i++) {
        const x = 500 + i * 500 + Math.random() * 100;
        const emoji = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const maxHealth = 20 + Math.floor(Math.random() * 15);

        const obsEl = document.createElement('div');
        obsEl.className = 'obstacle';
        obsEl.textContent = emoji;
        obsEl.style.left = `${x}px`;
        obsEl.style.bottom = '0px';
        obsEl.style.fontSize = '4em';
        obsEl.style.position = 'absolute';
        obsEl.style.opacity = '1';
        obsEl.style.zIndex = '3';
        container.appendChild(obsEl);

        gameState.obstacles.push({
            x: x,
            y: 0,
            height: 80,
            width: 60,
            health: maxHealth,
            maxHealth: maxHealth,
            element: obsEl,
            emoji: emoji
        });
    }
}

// 销毁建筑物
function destroyObstacle(obs) {
    if (obs.element) {
        // 爆炸效果
        createSkillEffect(obs.x, obs.y, '💥');
        setTimeout(() => {
            obs.element.style.transform = 'scale(0)';
            obs.element.style.opacity = '0';
            setTimeout(() => obs.element.remove(), 300);
        }, 100);
    }
}

// 暂停游戏
function pauseGame() {
    gameState.isPaused = true;
    document.getElementById('pause-screen').classList.remove('hidden');
}

// 继续游戏
function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-screen').classList.add('hidden');
}

// 结束游戏
function endGame() {
    clearInterval(gameState.timerInterval);

    let winner;
    if (gameState.player1.health > gameState.player2.health) {
        winner = gameState.player1;
    } else if (gameState.player2.health > gameState.player1.health) {
        winner = gameState.player2;
    } else {
        winner = { name: '平局', avatar: gameState.player1.avatar };
    }

    document.getElementById('winner-text').textContent = winner === gameState.player1 ? `${gameState.player1.name} 获胜！` :
                                                    winner === gameState.player2 ? `${gameState.player2.name} 获胜！` : '平局！';
    document.getElementById('winner-avatar').innerHTML = `<img src="${winner.avatar}" alt="获胜者">`;

    hideAllScreens();
    document.getElementById('game-over-screen').classList.remove('hidden');
    gameState.currentScreen = 'game-over';
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameState.timerInterval);
    resetGame();
    startGame();
}

// 隐藏所有界面
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
}

// 更新冲击波投射物
function updateShockwaveProjectiles() {
    gameState.shockwaveProjectiles = gameState.shockwaveProjectiles.filter(proj => {
        // 移动投射物
        proj.x += proj.vx;
        proj.traveled += Math.abs(proj.vx);

        // 更新DOM位置
        if (proj.element) {
            proj.element.style.left = `${proj.x}px`;
            proj.element.style.bottom = `${proj.y}px`;
        }

        // 检测与玩家的碰撞
        const target = proj.player === 1 ? gameState.player2 : gameState.player1;
        const distance = Math.abs(proj.x - target.x);
        const heightMatch = Math.abs(proj.y - (target.y + 60)) < 80; // 高度检测范围更大

        if (distance < 50 && heightMatch && proj.life > 0 && !target.isJumping) {
            // 跳跃免疫
            if (!target.isJumping) {
                let finalDamage = proj.damage;

                // 检查防御
                if (target.isBlocking) {
                    finalDamage = Math.floor(proj.damage * 0.2); // 防御减少80%伤害
                    createBlockEffect(target.x, target.y);
                }

                dealDamage(proj.player === 1 ? 2 : 1, finalDamage, false);
                createSkillEffect(target.x, target.y, '💫');

                // 移除投射物
                if (proj.element) {
                    proj.element.remove();
                }
                return false;
            }
        }

        // 检查是否超出范围（扩展到1700，确保能打到右边玩家2）
        if (proj.x < -100 || proj.x > 1700 || proj.life <= 0) {
            if (proj.element) {
                proj.element.remove();
            }
            return false;
        }

        proj.life--;
        return true;
    });
}

// 初始化游戏
init();
