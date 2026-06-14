// game.js

// ==========================================
// 1. 전역 상태 및 데이터베이스 정의
// ==========================================

let player = {
    gold: 0,
    currentRodIndex: 0,
    environment: 'sea' // 'sea', 'river', 또는 'freshwater'
};

let keepNet = []; // 살림통 배열
let isFishingActive = false; // 현재 미니게임 진행 여부
let isMouseDown = false; // 마우스 클릭 홀드 상태 변수

// 도감 컬렉션: 물고기별로 최대치 및 기록 보관
let COLLECTION = {}; // key: fishId -> { name, description, caughtCount, maxLength, maxWeight, maxGrade }

// 환경별 이미지 경로
const ENVIRONMENT_IMAGES = {
    'sea': null, // 바다는 video 사용
    'river': 'img/river_bg.png',
    'freshwater': 'img/freshwater_bg.png'
};

// 미끼 데이터베이스
const BAIT_DATABASE = [
    { id: 'worm', name: '지렁이', price: 20, image: 'img/bait_worm.png', description: '작은 어류가 좋아합니다.' },
    { id: 'paste', name: '떡밥', price: 40, image: 'img/bait_paste.png', description: '바닥 생활 어종에 효과적입니다.' },
    { id: 'lure', name: '루어', price: 150, image: 'img/bait_lure.png', description: '대형 포식성 어종을 유혹합니다.' },
    { id: 'shrimp', name: '새우', price: 60, image: 'img/bait_shrimp.png', description: '다양한 어종이 좋아하는 보편적 미끼입니다.' }
];

// 플레이어 미끼 인벤토리 및 장착 상태
player.baitInventory = {}; // baitId -> count
player.equippedBait = null; // 현재 장착된 baitId

// 15종 물고기 데이터 기획 (기존 시스템 계승 및 확장)
const FISH_DATABASE = [
    { id: 1, name: "베스", grade: "B", basePrice: 60, minLength: 25, maxLength: 50, minWeight: 400, maxWeight: 1800, image: "img/베스 이미지.png", description: "민물의 사냥꾼. 강한 턱으로 미끼를 깨물어 문다.", preferredBaits: ['lure'] },
    { id: 2, name: "연어", grade: "A", basePrice: 200, minLength: 50, maxLength: 90, minWeight: 2000, maxWeight: 6000, image: "img/연어 이미지.png", description: "바다에서 산 뒤 강으로 돌아오는 신비로운 물고기.", preferredBaits: ['lure','paste'] },
    { id: 3, name: "참치", grade: "S", basePrice: 800, minLength: 100, maxLength: 200, minWeight: 15000, maxWeight: 80000, image: "img/참치 이미지.png", description: "대양의 왕. 엄청난 힘과 속도로 유명하다.", preferredBaits: ['lure'] },
    { id: 4, name: "고등어", grade: "A", basePrice: 120, minLength: 20, maxLength: 50, minWeight: 300, maxWeight: 1200, image: "img/고등어 이미지.png", description: "등이 파란 것이 특징. 맛있는 흰살 생선.", preferredBaits: ['paste','worm'] },
    { id: 5, name: "갈치", grade: "S", basePrice: 1500, minLength: 150, maxLength: 250, minWeight: 7000, maxWeight: 22000, image: "img/갈치 이미지.png", description: "길고 가늘한 몸. 은빛으로 빛나는 고급 생선.", preferredBaits: ['lure'] },
    { id: 6, name: "넙치", grade: "B", basePrice: 70, minLength: 30, maxLength: 70, minWeight: 500, maxWeight: 2500, image: "img/넙치 이미지.png", description: "납작한 몸으로 바닥에 숨어있다. 양쪽 눈이 한쪽에 모여있다.", preferredBaits: ['paste'] },
    { id: 7, name: "오징어", grade: "B", basePrice: 80, minLength: 25, maxLength: 80, minWeight: 200, maxWeight: 1500, image: "img/오징어 이미지.png", description: "8개의 팔로 먹이를 잡는다. 지능이 높은 생물.", preferredBaits: ['worm','paste'] },
    { id: 8, name: "청세치", grade: "A", basePrice: 130, minLength: 30, maxLength: 70, minWeight: 500, maxWeight: 2500, image: "img/청세치 이미지.png", description: "푸른 빛깔의 우아한 생선. 매운맛이 난다.", preferredBaits: ['lure'] },
    { id: 9, name: "쏨뱅이", grade: "B", basePrice: 90, minLength: 20, maxLength: 45, minWeight: 300, maxWeight: 1200, image: "img/쏨뱅이 이미지.png", description: "가시가 있는 외모지만 맛은 훌륭하다.", preferredBaits: ['paste'] },
    { id: 10, name: "도리", grade: "C", basePrice: 15, minLength: 8, maxLength: 18, minWeight: 30, maxWeight: 120, image: "img/도리 이미지.png", description: "작지만 아름다운 줄무늬 생선. 수족관의 스타.", preferredBaits: ['worm'] },
    { id: 11, name: "멸치", grade: "C", basePrice: 10, minLength: 5, maxLength: 15, minWeight: 10, maxWeight: 80, image: "img/멸치 이미지.png", description: "아주 작은 생선. 말린 멸치로 국물을 낸다.", preferredBaits: ['worm'] },
    { id: 12, name: "도미", grade: "A", basePrice: 220, minLength: 40, maxLength: 80, minWeight: 1000, maxWeight: 4000, image: "img/도미 이미지.png", description: "고급 회 생선. 살이 단단하고 맛이 좋다.", preferredBaits: ['paste'] },
    { id: 13, name: "복어", grade: "S", basePrice: 500, minLength: 25, maxLength: 60, minWeight: 500, maxWeight: 2500, image: "img/복어 이미지.png", description: "독성을 가진 위험한 고급 생선. 조리에 주의가 필요.", preferredBaits: ['paste'] },
    { id: 14, name: "상어", grade: "S", basePrice: 1800, minLength: 200, maxLength: 350, minWeight: 30000, maxWeight: 100000, image: "img/상어 이미지.png", description: "대양의 최강 포식자. 날카로운 이빨이 무섭다.", preferredBaits: ['lure'] },
    { id: 15, name: "흰동가리", grade: "C", basePrice: 20, minLength: 8, maxLength: 18, minWeight: 50, maxWeight: 200, image: "img/흰동가리.png", description: "주황색 줄무늬 귀여운 생선. 말미잘과 함께 산다.", preferredBaits: ['worm'] }
];

// 낚싯대 등급별 가중치 및 이미지 경로 (C, B, A, S 순서)
const ROD_DATABASE = [
    { name: "대나무 낚싯대", grade: "C", price: 0, rates: [70, 20, 10, 0], purchased: true, image: "img/대나무 낚싯대.png" },
    { name: "글라스파이브", grade: "B", price: 500, rates: [30, 50, 15, 5], purchased: false, image: "img/글라스파이브.png" },
    { name: "카본 중경질대", grade: "A", price: 2500, rates: [10, 30, 45, 15], purchased: false, image: "img/카본 중경질대.png" },
    { name: "티타늄 하이엔드", grade: "S", price: 10000, rates: [0, 10, 40, 50], purchased: false, image: "img/티타늄 하이엔드.png" }
];

// ==========================================
// 2. 미니게임 물리 엔진 변수
// ==========================================

const TANK_HEIGHT = 250; // 수직 바 총 높이(px)
let greenBarHeight = 90;  // 초록 바 높이(px)
let fishIconHeight = 24;  // 물고기 아이콘 높이(px)

// 위치값(Y축, Bottom 기준: 0이 바닥)
let greenBarY = 0;
let greenBarVelocity = 0; // 초록바의 이동 속도

let fishY = 100;
let fishTargetY = 100; // 물고기 AI 목표지점
let fishTimer = 0;     // AI 방향 전환 주기 카운터

let catchProgress = 30; // 포획 진행도 게이지 (시작시 30%)
let currentTargetFish = null; // 현재 바늘에 걸려 힘겨루기 중인 물고기 정보
let currentModalInstance = null; // 마지막으로 잡힌 물고기 인스턴스 (모달용)

// 물리 계수 개별 튜닝
const GRAVITY = 0.14;      // 중력 강도
const LIFT = 0.38;         // 마우스 클릭 시 상승 가속도
const DRAG = 0.90;         // 물속 저항력
const BOUNCE = -0.28;      // 바닥 충돌 시 튕김 계수 (음수)
const FISH_LERP = 0.040;   // 물고기 자연 이동 속도 (작을수록 느림)
const FISH_FOLLOW_STRENGTH = 0.10; // 녹색 바를 따라올 때 보정 속도
const FISH_FOLLOW_RANGE = 140;     // 녹색 바를 따라오기 시작하는 거리
const FISH_AWARENESS_CHANCE = 0.30; // 바를 인지하고 따라오려는 확률
const FISH_RANDOMNESS = 0.03;      // 물고기 이동 랜덤성 강도

// ==========================================
// 3. 핵심 비즈니스 로직 및 연산 함수
// ==========================================

// [요구사항 1] 물고기 가치 계산 함수
function calculatePrice(fish, length, weight) {
    const lenRatio = (length - fish.minLength) / (fish.maxLength - fish.minLength || 1);
    const weiRatio = (weight - fish.minWeight) / (fish.maxWeight - fish.minWeight || 1);
    const finalPrice = fish.basePrice * (1 + lenRatio * 0.5 + weiRatio * 0.5);
    return Math.floor(finalPrice);
}

// 등급 가중치 주사위 굴려 물고기 확정
function rollFishByRod() {
    const currentRod = ROD_DATABASE[player.currentRodIndex];
    const rates = currentRod.rates;
    const randomPick = Math.random() * 100;
    let selectedGrade = "C";

    if (randomPick < rates[0]) selectedGrade = "C";
    else if (randomPick < rates[0] + rates[1]) selectedGrade = "B";
    else if (randomPick < rates[0] + rates[1] + rates[2]) selectedGrade = "A";
    else selectedGrade = "S";

    const gradePool = FISH_DATABASE.filter(f => f.grade === selectedGrade);

    // 미끼 장착 시 선호하는 물고기가 있다면 우선 선택 확률 부여
    if (player.equippedBait) {
        const preferredPool = gradePool.filter(f => f.preferredBaits && f.preferredBaits.includes(player.equippedBait));
        if (preferredPool.length > 0) {
            // 70% 확률로 선호 어종 선택, 아니면 전체에서 선택
            if (Math.random() < 0.7) {
                return preferredPool[Math.floor(Math.random() * preferredPool.length)];
            }
        }
    }

    return gradePool[Math.floor(Math.random() * gradePool.length)];
}

// helper: convert grade to numeric rank
function gradeToRank(g) {
    if (g === 'C') return 1;
    if (g === 'B') return 2;
    if (g === 'A') return 3;
    if (g === 'S') return 4;
    return 0;
}

// 도감 업데이트
function updateCollection(caughtInstance) {
    const fishId = caughtInstance.fishId;
    const fishDef = FISH_DATABASE.find(f => f.id === fishId) || {};
    if (!COLLECTION[fishId]) {
        COLLECTION[fishId] = {
            name: fishDef.name || caughtInstance.name,
            description: fishDef.description || '',
            caughtCount: 0,
            maxLength: 0,
            maxWeight: 0,
            maxGrade: caughtInstance.grade || 'C'
        };
    }
    const rec = COLLECTION[fishId];
    rec.caughtCount += 1;
    if (caughtInstance.length > rec.maxLength) rec.maxLength = caughtInstance.length;
    if (caughtInstance.weight > rec.maxWeight) rec.maxWeight = caughtInstance.weight;
    if (gradeToRank(caughtInstance.grade) > gradeToRank(rec.maxGrade)) rec.maxGrade = caughtInstance.grade;
}

// 미끼 구매 (quantity 개수 만큼)
function buyBait(index, quantity = 1) {
    const bait = BAIT_DATABASE[index];
    if (!bait) return;
    quantity = Math.max(1, Math.floor(quantity));
    const totalPrice = bait.price * quantity;
    if (player.gold < totalPrice) {
        alert('골드가 부족합니다.');
        return;
    }
    player.gold -= totalPrice;
    player.baitInventory[bait.id] = (player.baitInventory[bait.id] || 0) + quantity;
    alert(`🎣 ${bait.name} ${quantity}개를 구입했습니다.`);
    updateUI();
}

function equipBait(baitId) {
    if (!player.baitInventory[baitId] || player.baitInventory[baitId] <= 0) {
        alert('해당 미끼가 인벤토리에 없습니다.');
        return;
    }
    player.equippedBait = baitId;
    alert('미끼를 장착했습니다.');
    updateUI();
}

// 미끼 해제
function unequipBait() {
    if (!player.equippedBait) {
        alert('장착된 미끼가 없습니다.');
        return;
    }
    const baitDef = BAIT_DATABASE.find(b => b.id === player.equippedBait);
    player.equippedBait = null;
    alert(`${baitDef?.name || '미끼'}를 해제했습니다.`);
    updateUI();
}

// 환경 이미지 업데이트
function updateEnvironmentImage() {
    const video = document.getElementById('sea-video');
    const envImg = document.getElementById('sea-environment-image');
    const boat = document.querySelector('.boat-and-fisherman');
    
    // 어부 캐릭터 위치 업데이트
    if (boat) {
        boat.classList.remove('sea-position', 'river-position', 'freshwater-position');
        if (player.environment === 'sea') {
            boat.classList.add('sea-position');
        } else if (player.environment === 'river') {
            boat.classList.add('river-position');
        } else if (player.environment === 'freshwater') {
            boat.classList.add('freshwater-position');
        }
    }
    
    if (player.environment === 'sea') {
        // 바다: video 표시, 환경 이미지 숨김
        if (video) video.classList.remove('hidden');
        if (envImg) envImg.classList.add('hidden');
    } else {
        // 강/민물: video 숨김, 환경 이미지 표시
        if (video) video.classList.add('hidden');
        if (envImg) {
            envImg.src = encodeURI(ENVIRONMENT_IMAGES[player.environment]);
            envImg.classList.remove('hidden');
        }
    }
}

// ==========================================
// 4. 스타듀밸리 낚시 물리 엔진 핵심 루프
// ==========================================

function startFishingMinigame() {
    if (isFishingActive) return;
    if (keepNet.length >= 30) {
        alert("살림통이 가득 찼습니다! 물고기를 판매하세요.");
        return;
    }

    // 미니게임 초기화 및 타겟 물고기 설정
    isFishingActive = true;
    catchProgress = 30; 
    greenBarY = 0;
    greenBarVelocity = 0;
    fishY = 100;
    
    currentTargetFish = rollFishByRod();
    // 미끼가 장착되어 있으면 사용(소모)
    if (player.equippedBait) {
        const bid = player.equippedBait;
        if (player.baitInventory[bid] && player.baitInventory[bid] > 0) {
            player.baitInventory[bid] -= 1;
            // 수량이 0이면 자동으로 해제
            if (player.baitInventory[bid] <= 0) {
                player.equippedBait = null;
                alert('장착한 미끼가 소모되어 해제되었습니다.');
            }
        } else {
            // 소유하지 않으면 해제
            player.equippedBait = null;
        }
    }
    
    // UI 활성화
    document.getElementById("minigame-container").classList.remove("hidden");
    
    // 엔진 가동
    requestAnimationFrame(updatePhysicsLoop);
}

function updatePhysicsLoop() {
    if (!isFishingActive) return;

    // --- A. 초록색 바 물리 연산 (조작 및 중력) ---
    if (isMouseDown) {
        greenBarVelocity += LIFT; // 마우스 다운 시 위로 가속
    } else {
        greenBarVelocity -= GRAVITY; // 평상시 중력 하강
    }
    
    greenBarVelocity *= DRAG; // 물속 저항으로 느긋한 움직임
    greenBarY += greenBarVelocity;

    // 바닥/천장 경계선 및 튕김(Bounce) 처리
    if (greenBarY <= 0) {
        greenBarY = 0;
        greenBarVelocity = greenBarVelocity * BOUNCE; // 바닥 튕김
    }
    const maxBarY = TANK_HEIGHT - greenBarHeight;
    if (greenBarY >= maxBarY) {
        greenBarY = maxBarY;
        greenBarVelocity = 0; // 천장은 충돌 시 속도 상쇄
    }

    // --- B. 물고기 AI 연산 (상, 하 무작위 불규칙 부동) ---
    fishTimer--;
    if (fishTimer <= 0) {
        // 무작위 목적지 및 유지 시간 갱신 (부드러운 변속 제어)
        fishTargetY = Math.random() * (TANK_HEIGHT - fishIconHeight);
        fishTimer = Math.floor(Math.random() * 60) + 40;
    }

    const barCenterY = greenBarY + greenBarHeight / 2 - fishIconHeight / 2;
    const followDistance = Math.abs(barCenterY - fishY);
    const randomBias = (Math.random() - 0.5) * FISH_RANDOMNESS * TANK_HEIGHT;

    if (followDistance < FISH_FOLLOW_RANGE && Math.random() < FISH_AWARENESS_CHANCE) {
        // 랜덤성을 유지하면서 녹색 바 방향으로 천천히 유도
        fishY += (barCenterY + randomBias - fishY) * FISH_FOLLOW_STRENGTH;
    } else {
        // 랜덤하게 튀어다니는 자연스러운 이동
        fishY += (fishTargetY + randomBias - fishY) * FISH_LERP;
    }

    // 물고기 위치 제한
    fishY = Math.min(Math.max(fishY, 0), TANK_HEIGHT - fishIconHeight);

    // --- C. 충돌 체크 및 승리/패배 게이지 정산 ---
    // 초록색 바 영역 내부(Y축)에 물고기가 걸쳐있는지 판정
    const isOverlapping = (fishY >= greenBarY) && ((fishY + fishIconHeight) <= (greenBarY + greenBarHeight));

    if (isOverlapping) {
        catchProgress += 0.4; // 겹쳐있으면 상승
    } else {
        catchProgress -= 0.25; // 벗어나면 더 천천히 감소
    }

    // 게이지 한계치 가둠
    catchProgress = Math.min(100, Math.max(0, catchProgress));

    // --- D. 실시간 DOM 가상 렌더링 피드백 ---
    document.getElementById("green-bar").style.bottom = `${greenBarY}px`;
    document.getElementById("fish-icon").style.bottom = `${fishY}px`;
    document.getElementById("catch-progress-bar").style.height = `${catchProgress}%`;

    // --- E. 승리 및 패배 조건 판정 ---
    if (catchProgress >= 100) {
        endGame(true);
    } else if (catchProgress <= 0) {
        endGame(false);
    } else {
        // 조건 불충족 시 루프 계속 실행
        requestAnimationFrame(updatePhysicsLoop);
    }
}

function endGame(isSuccess) {
    isFishingActive = false;
    document.getElementById("minigame-container").classList.add("hidden");

    if (isSuccess && currentTargetFish) {
        // 무작위 정밀 수치 생성
        const finalLen = Number((Math.random() * (currentTargetFish.maxLength - currentTargetFish.minLength) + currentTargetFish.minLength).toFixed(1));
        const finalWei = Number((Math.random() * (currentTargetFish.maxWeight - currentTargetFish.minWeight) + currentTargetFish.minWeight).toFixed(1));
        const finalPrice = calculatePrice(currentTargetFish, finalLen, finalWei);

        const defaultImagePath = currentTargetFish.image || `img/fish_${String(currentTargetFish.id).padStart(2, '0')}.png`;
        const caughtInstance = {
            instanceId: Date.now() + Math.random().toString(36).substr(2, 4),
            fishId: currentTargetFish.id,
            name: currentTargetFish.name,
            grade: currentTargetFish.grade,
            length: finalLen,
            weight: finalWei,
            price: finalPrice,
            image: defaultImagePath
        };

        keepNet.push(caughtInstance);
        // 도감 갱신
        updateCollection(caughtInstance);
        // 중앙 모달로 잡힌 물고기 표시 (이미지 편집/배경 변경 가능)
        currentModalInstance = caughtInstance;
        showCatchModal(caughtInstance, finalLen, finalWei);
    } else {
        alert("❌ 물고기가 도망쳤습니다...");
    }

    currentTargetFish = null;
    updateUI();
}

// ==========================================
// 5. 살림통 판매 시스템 및 상점 UI 렌더러
// ==========================================

// [요구사항 2] 선택한 물고기만 다중 판매
function sellSelectedFish() {
    const checkboxes = document.querySelectorAll('.select-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("판매할 물고기를 선택해 주세요.");
        return;
    }

    let totalEarnings = 0;
    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        const idx = keepNet.findIndex(item => item.instanceId === id);
        if (idx !== -1) {
            totalEarnings += keepNet[idx].price;
            keepNet.splice(idx, 1);
        }
    });

    player.gold += totalEarnings;
    alert(`💰 선택 판매 완료! +${totalEarnings}G 를 획득했습니다.`);
    updateUI();
}

// [요구사항 X] 살림통에 있는 물고기 전부 판매
function sellAllFish() {
    if (keepNet.length === 0) {
        alert("살림통에 판매할 물고기가 없습니다.");
        return;
    }
    let totalEarnings = keepNet.reduce((sum, it) => sum + (it.price || 0), 0);
    keepNet = [];
    player.gold += totalEarnings;
    alert(`💰 전체 판매 완료! +${totalEarnings}G 를 획득했습니다.`);
    updateUI();
}

// [요구사항 3] 상점 골드 구매 및 등급 교체
function buyRod(index) {
    const shopRod = ROD_DATABASE[index];
    if (shopRod.purchased) {
        player.currentRodIndex = index;
        alert(`⚡ [${shopRod.name}] 장착 완료! 고등급 물고기 확률이 상승합니다.`);
        updateUI();
        return;
    }

    if (player.gold < shopRod.price) {
        alert("골드가 부족합니다.");
        return;
    }

    player.gold -= shopRod.price;
    ROD_DATABASE[index].purchased = true;
    player.currentRodIndex = index;
    alert(`⚡ [${shopRod.name}] 구매 및 장착 완료! 고등급 물고기 확률이 상승합니다.`);
    updateUI();
}

// UI 종합 업데이트 및 그리기 함수
function updateUI() {
    document.getElementById("gold-display").innerText = player.gold.toLocaleString();
    const currentRod = ROD_DATABASE[player.currentRodIndex];
    document.getElementById("rod-display").innerText = `${currentRod.name} (${currentRod.grade}등급)`;
    document.getElementById("fish-count").innerText = keepNet.length;

    // 살림통 바인딩
    const netContainer = document.getElementById("keep-net");
    netContainer.innerHTML = keepNet.length === 0 ? '<p class="empty-msg">살림통이 비어있습니다.</p>' : '';
    
    keepNet.forEach(f => {
        const card = document.createElement("div");
        card.className = "fish-card";
        card.innerHTML = `
            <img class="fish-img" src="${encodeURI(f.image)}" alt="${f.name}" onerror="this.style.display='none'">
            <div><strong>${f.name}</strong> [${f.grade}]</div>
            <div>길이: ${f.length.toLocaleString()}cm</div>
            <div>무게: ${f.weight.toLocaleString()}g</div>
            <div>가격: ${f.price.toLocaleString()} G</div>
            <label><input type="checkbox" class="select-checkbox" data-id="${f.instanceId}"> 선택</label>
        `;
        netContainer.appendChild(card);
    });

    // --- 장착된 미끼 표시 ---
    const equippedDisplay = document.getElementById('equipped-bait-display');
    if (equippedDisplay) {
        if (player.equippedBait) {
            const equippedBait = BAIT_DATABASE.find(b => b.id === player.equippedBait);
            if (equippedBait) {
                equippedDisplay.innerHTML = `
                    <div class="equipped-bait-card">
                        <img class="bait-img" src="${encodeURI(equippedBait.image)}" alt="${equippedBait.name}" onerror="this.style.display='none'">
                        <div class="equipped-info">
                            <div><strong>${equippedBait.name}</strong> (${player.baitInventory[player.equippedBait]}개)</div>
                            <div style="font-size:0.9rem;color:#666;margin-top:4px;">${equippedBait.description}</div>
                        </div>
                        <button class="btn-danger" style="margin-top:8px;">해제</button>
                    </div>
                `;
                equippedDisplay.querySelector('button').addEventListener('click', () => unequipBait());
            }
        } else {
            equippedDisplay.innerHTML = '<p class="empty-msg">장착된 미끼가 없습니다.</p>';
        }
    }

    // --- 미끼 인벤토리 렌더링 ---
    const baitInv = document.getElementById('bait-inventory');
    if (baitInv) {
        const ownedIds = Object.keys(player.baitInventory).filter(id => player.baitInventory[id] > 0);
        if (ownedIds.length === 0) {
            baitInv.innerHTML = '<p class="empty-msg">미끼가 없습니다.</p>';
        } else {
            baitInv.innerHTML = '';
            // Render each owned bait as a card
            BAIT_DATABASE.forEach(b => {
                const count = player.baitInventory[b.id] || 0;
                if (count > 0) {
                    const bc = document.createElement('div');
                    bc.className = 'bait-card';
                    bc.innerHTML = `
                        <img class="bait-img" src="${encodeURI(b.image)}" alt="${b.name}" onerror="this.style.display='none'">
                        <div><strong>${b.name}</strong></div>
                        <div class="count">수량: ${count}</div>
                    `;
                    const eq = document.createElement('button');
                    eq.textContent = (player.equippedBait === b.id) ? '장착 중' : '장착';
                    eq.className = 'btn-primary';
                    eq.disabled = (player.equippedBait === b.id);
                    eq.addEventListener('click', () => equipBait(b.id));
                    bc.appendChild(eq);
                    baitInv.appendChild(bc);
                }
            });
        }
    }

    // 도감 렌더링
    const colContainer = document.getElementById('collection-container');
    if (colContainer) {
        const keys = Object.keys(COLLECTION);
        if (keys.length === 0) {
            colContainer.innerHTML = '<p class="empty-msg">아직 잡은 물고기가 없습니다.</p>';
        } else {
            colContainer.innerHTML = '';
            keys.sort((a,b)=>Number(a)-Number(b)).forEach(k => {
                    const r = COLLECTION[k];
                    const fishDef = FISH_DATABASE.find(f => f.id === Number(k)) || {};
                    const div = document.createElement('div');
                    div.className = 'collection-card';
                    div.innerHTML = `
                        <div class="collection-top">
                            <img class="collection-img" src="${encodeURI(fishDef.image || '')}" alt="${r.name}" onerror="this.style.display='none'">
                            <div class="collection-meta">
                                <div><strong>${r.name}</strong> (최대 등급: ${r.maxGrade})</div>
                                <div style="font-size:0.9rem;color:#666;margin-top:4px;">${r.description}</div>
                            </div>
                        </div>
                        <div style="margin-top:6px;font-size:0.9rem;">채집 수: ${r.caughtCount} / 최대길이: ${r.maxLength}cm / 최대무게: ${r.maxWeight}g</div>
                    `;
                    colContainer.appendChild(div);
            });
        }
    }

    // 상점 목록 렌더링
    const shopContainer = document.getElementById("shop-container");
    shopContainer.innerHTML = "";

    // --- 미끼 목록 (리스트 레이아웃, 묶음구매 컨트롤 포함) ---
    const baitList = document.createElement('div');
    baitList.className = 'bait-shop-list';
    BAIT_DATABASE.forEach((bait, bIndex) => {
        const owned = player.baitInventory[bait.id] || 0;
        const item = document.createElement('div');
        item.className = 'bait-shop-item';

        item.innerHTML = `
            <img class="bait-img" src="${encodeURI(bait.image)}" alt="${bait.name}" onerror="this.style.display='none'">
            <div class="bait-meta">
                <div><strong>${bait.name}</strong></div>
                <div style="font-size:0.9rem;color:#666;margin-top:4px;">${bait.description}</div>
                <div style="margin-top:6px;">가격: ${bait.price.toLocaleString()} G / 소유: ${owned}</div>
            </div>
        `;

        // quantity controls
        const controls = document.createElement('div');
        controls.className = 'qty-controls';
        let qty = 1;
        const qtyDisplay = document.createElement('span');
        qtyDisplay.className = 'qty-display';
        qtyDisplay.innerText = qty;

        const decBtn = document.createElement('button');
        decBtn.textContent = '-5';
        decBtn.className = 'btn-secondary';
        decBtn.addEventListener('click', () => {
            qty = Math.max(1, qty - 5);
            qtyDisplay.innerText = qty;
        });

        const incBtn = document.createElement('button');
        incBtn.textContent = '+5';
        incBtn.className = 'btn-primary';
        incBtn.addEventListener('click', () => {
            qty = qty + 5;
            qtyDisplay.innerText = qty;
        });

        const buyBtn = document.createElement('button');
        buyBtn.textContent = '구매';
        buyBtn.className = 'btn-buy';
        buyBtn.addEventListener('click', () => buyBait(bIndex, qty));

        const equipBtn = document.createElement('button');
        equipBtn.textContent = (player.equippedBait === bait.id) ? '장착 중' : '장착';
        equipBtn.disabled = !(player.baitInventory[bait.id] > 0) || (player.equippedBait === bait.id);
        equipBtn.className = 'btn-secondary';
        equipBtn.addEventListener('click', () => equipBait(bait.id));

        controls.appendChild(decBtn);
        controls.appendChild(qtyDisplay);
        controls.appendChild(incBtn);
        controls.appendChild(buyBtn);
        controls.appendChild(equipBtn);

        item.appendChild(controls);
        baitList.appendChild(item);
    });
    shopContainer.appendChild(baitList);

    // --- 낚싯대 목록 ---
    ROD_DATABASE.forEach((rod, index) => {
        const shopCard = document.createElement("div");
        shopCard.className = "shop-card";
        shopCard.innerHTML = `
            <img class="rod-img" src="${encodeURI(rod.image)}" alt="${rod.name}" onerror="this.style.display='none'">
            <div><strong>${rod.name}</strong></div>
            <div>등급: ${rod.grade} / 가격: ${rod.price.toLocaleString()} G</div>
            <div>${rod.purchased ? "구매 완료" : "구매 가능"}</div>
        `;

        const actionButton = document.createElement("button");
        actionButton.textContent = rod.purchased ? (player.currentRodIndex === index ? "장착 중" : "착용") : "구매";
        actionButton.disabled = (player.currentRodIndex === index) || (!rod.purchased && player.gold < rod.price);
        actionButton.className = rod.purchased ? "btn-secondary" : "btn-primary";
        actionButton.addEventListener("click", () => buyRod(index));
        shopCard.appendChild(actionButton);
        shopContainer.appendChild(shopCard);
    });
}

// -------------------------
// Catch modal functions
// -------------------------
function showCatchModal(instance, lengthVal, weightVal) {
    const modal = document.getElementById('catch-modal');
    const overlay = document.getElementById('catch-modal-overlay');
    const img = document.getElementById('catch-modal-img');
    const info = document.getElementById('catch-modal-info');
    const title = document.getElementById('catch-modal-title');

    if (!modal || !img) return;
    
    const imagePath = instance.image || '';
    console.log('🎣 이미지 경로:', imagePath);
    
    img.src = encodeURI(imagePath);
    img.onerror = function() {
        console.warn('⚠️ 이미지 로드 실패:', imagePath);
        this.style.backgroundColor = '#e2e8f0';
        this.style.display = 'block';
        this.style.fontSize = '48px';
        this.style.textAlign = 'center';
        this.style.lineHeight = '220px';
    };
    img.onload = function() {
        console.log('✅ 이미지 로드 성공:', imagePath);
    };
    
    title.innerText = `🎉 ${instance.name}을(를) 잡았습니다!`;
    const fish = currentTargetFish || FISH_DATABASE.find(f => f.name === instance.name);
    const description = fish ? fish.description : "신비로운 물고기...";
    info.innerHTML = `<div style="margin-bottom: 8px;">길이: ${lengthVal}cm / 무게: ${weightVal}g</div><div style="font-size: 0.9rem; color: #666; font-style: italic;">"${description}"</div>`;
    
    modal.classList.remove('hidden');
    overlay.style.backgroundImage = '';
}

function hideCatchModal() {
    const modal = document.getElementById('catch-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function setupCatchModalHandlers() {
    const applyBtn = document.getElementById('modal-apply-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    const closeX = document.getElementById('catch-modal-close');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const img = document.getElementById('catch-modal-img');
            if (currentModalInstance && img && img.src) {
                // 저장 (메모리): 살림통 항목의 이미지 경로를 업데이트
                currentModalInstance.image = img.src;
                updateUI();
            }
            hideCatchModal();
        });
    }

    const hide = () => hideCatchModal();
    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (closeX) closeX.addEventListener('click', hide);
}

function setupEventListeners() {
    const fishButton = document.getElementById("fish-btn");
    const sellButton = document.getElementById("sell-selected-btn");

    fishButton.addEventListener("mousedown", () => {
        isMouseDown = true;
    });
    fishButton.addEventListener("mouseup", () => {
        isMouseDown = false;
    });
    fishButton.addEventListener("mouseleave", () => {
        isMouseDown = false;
    });
    fishButton.addEventListener("click", () => {
        if (!isFishingActive) {
            startFishingMinigame();
        }
    });

    sellButton.addEventListener("click", sellSelectedFish);
    const sellAllButton = document.getElementById("sell-all-btn");
    if (sellAllButton) sellAllButton.addEventListener("click", sellAllFish);

    // 환경 선택 버튼 (바다/강/민물)
    const seaBtn = document.getElementById("sea-btn");
    const riverBtn = document.getElementById("river-btn");
    const freshwaterBtn = document.getElementById("freshwater-btn");
    
    const updateEnvButtons = () => {
        // 모든 버튼의 active 상태 제거
        if (seaBtn) seaBtn.classList.remove("active");
        if (riverBtn) riverBtn.classList.remove("active");
        if (freshwaterBtn) freshwaterBtn.classList.remove("active");
        
        // 현재 환경 버튼에만 active 추가
        if (player.environment === 'sea' && seaBtn) seaBtn.classList.add("active");
        if (player.environment === 'river' && riverBtn) riverBtn.classList.add("active");
        if (player.environment === 'freshwater' && freshwaterBtn) freshwaterBtn.classList.add("active");
    };
    
    if (seaBtn) {
        seaBtn.addEventListener("click", () => {
            player.environment = 'sea';
            updateEnvButtons();
            updateEnvironmentImage();
            alert("바다로 돌아왔습니다!");
        });
    }
    
    if (riverBtn) {
        riverBtn.addEventListener("click", () => {
            player.environment = 'river';
            updateEnvButtons();
            updateEnvironmentImage();
            alert("강으로 이동했습니다!");
        });
    }
    
    if (freshwaterBtn) {
        freshwaterBtn.addEventListener("click", () => {
            player.environment = 'freshwater';
            updateEnvButtons();
            updateEnvironmentImage();
            alert("민물로 이동했습니다!");
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    setupCatchModalHandlers();
    updateEnvironmentImage();
    updateUI();
});
