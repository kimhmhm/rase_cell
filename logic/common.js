/*
남은 구현할 것
우선순위대로 정렬
1. 음식좌표와 셀의 좌표가 겹쳤을 경우 음식 제거 ****완료****
2. 음식 렌더링 ****완료****
3. 세포의 움직임을 시간당 움직일 픽셀로 수정 ****완료****
4. 배고픔 수치 구현 계속 감소하다 음식 먹으면 회복 ****완료****
   - 배고픔 수치 다 떨어지면 세포 사망
   - 사망하되 세포가 일정 수 이상 감소하면 배고픔 수치 초기화 >// 임시로 해놨지만 세포가 한번에 전부 동시에 죽으면 해결안됨 > 처음 실행하고 먹이 하나도 안주고 가만히 있는 상태인 거임

5. 셀에 탐지범위 넣어서 탐지범위 이상 멀면 음식 추적 안함 ****완료****
6. 번식기능 음식 몇개 이상 먹으면 두마리로 분열 하기 이때 세포 색깔이 유전된다
7. 사망시 시체 구현 ****완료****
8. 음식을 찾지 않고 있는 기본 상태에서 조금씩 꾸물거리면서 움직이는 기능 ****완료****
9. 세포가 먹은 음식의 카운트 마다 세포의 크기를 점점 키우기 분열할 때 줄어듬****완료****
10. 세포들과 음식의 겹치는 좌표값 조정 좌측 상단 기준으로 잡혀있는 좌표 조절해야함 ****완료****
11. 세포들의 수와 현재 세포들의 색깔당 세포수를 로컬에 저장해서 다시 키면 그대로 세포생성 기능
*/

// 전역변수
let cellInfos = []; // 생성된 세포들의 정보를 담음
// 만약 세포를 제거할 때는 정보와 렌더링된 세포 둘다 제거해야함
let foods = []; // 배치된 음식들 클릭하면 생김
let foodIdCount = 0;// 음식의 id값을 겹치지 않게 추가 하기 위한 값 > 기존에는 foods.length로 넣었엇으나 음식 연타시 겹침
let cellIdCount = 0; // 위 음식과 마찬가지 이유로 자식 세포들의 id값을 겹치지 않게 하기 위함
const worldIntervalTime = 1000; // 진행될 세계 시간 간격 ms
const cellSpeed = 20 // 월드타임 인터벌당 세포가 움직일 px수 (worldIntervalTime=1000ms 면 1초당 움직일 픽셀)
const cellLifeTime = 1.5 * 60 * 1000; // 세포가 살아있을 시간 맨 앞에 분단위로 입력할 것 소수점 가능
let randomFood = null; // 일정 시간마다 랜덤한 위치에 음식을 뿌리는 타이머를 담을 변수

const setEvent = () => {
  // main에 걸 이벤트
  const main = document.querySelector("#main");
  main.addEventListener("click", (e) => {
    _addFood(e);
  });
}

const _addFood = (e,random = false)=>{
  const addfoodCount = 4; // 한번에 생성할 음식 개수
  const addRadius = 80; // 클릭한 좌표 기준으로 음식 생성될 반경
  const direction = [1,-1]
  const main = document.getElementById("main");
  const wd = parseInt(main.clientWidth);
  const wh = parseInt(main.clientHeight);
  const posX = random ? Math.floor(Math.random()*wd) : e.pageX;
  const posY = random ? Math.floor(Math.random()*wh) : e.pageY;
  for(let i =1; i <= addfoodCount; i++){
    const randomX = direction[Math.floor(Math.random()*direction.length)]*(Math.floor(addRadius * Math.random())+1)
    const randomY = direction[Math.floor(Math.random()*direction.length)]*(Math.floor(addRadius * Math.random())+1)
    let foodX = randomX + posX;
    let foodY = randomY + posY;
    if(foodX > wd - 1 ){
      foodX = wd - 1;
    }
    if(foodY > wh - 1){
      foodY = wh - 1;
    }
    if(foodX <= 0){
      foodX = 1;
    }
    if(foodY <= 0 ){
      foodY = 1;
    }
    const food = {
      x: foodX , // food의 x좌표
      y: foodY, // food의 y좌표
      color: "#fff",
      width: 2,
      height: 2,
      radius: "50%",
      id: foodIdCount,
    }
    foods.push(food);
    foodIdCount++;
    _renderFood(food);
  }
}

const _renderFood = (food) => {
  // 음식의 정보를 가지고 음식을 렌더링함
  const main = document.querySelector("#main");
  const foodDOM = document.createElement("div");
  foodDOM.classList.add("food");
  foodDOM.setAttribute("id", `food-${food.id}`);
  foodDOM.style.cssText = `
     width:${food.width}px;
     height:${food.height}px;
     position:absolute;
     left:${food.x}px;
     top:${food.y}px;
     background-color:${food.color};
     border-radius:${food.radius};
    `
  main.append(foodDOM);
}

const _createCellInfo = (id) => {
  // 위치 값 v
  // 형태 v
  // 무빙 
  // 배고픔
  /* 세포하나의 정보를 세팅한다 */
  const cell = {};
  cell.id = cellIdCount; // 각 세포를 구분하기 위한 id값
  cell.radius = 5; // 세포의 반지름
  cell.width = cell.radius * 2;
  cell.height = cell.radius * 2;
  cell.color = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
  cell.roundness = "50%" // 둥글기
  cell.x = _cellPositionSetting(cell.radius).x; //기본 세포 중심 x축 위치
  cell.y = _cellPositionSetting(cell.radius).y; // 기본 세포 중심 y축 위치
  cell.defautX = _randomDefault(); // 먹이를 탐색하지 않을 때 움직일 x축 방향
  cell.defautY = _randomDefault(cell.defautX); // 먹이를 탐색하지 않을 때 움직일 y축 방향 만약 x축이0이면 y축은 1이나 -1만 나오게 함 정지를 방지
  cell.move = _cellMove; // 움직임
  cell.eatCount = 0; // 음식 먹은 횟수
  cell.detectRadius = 150; // 세포의 음식 탐지 반경
  cell.hunger = cellLifeTime;
  cell.renderX = cell.x - cell.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  cell.renderY = cell.y - cell.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  cell.growth = _growthCell;
  cell.deGrowth = _degrowth;
  cellIdCount++; // 세포 아이디카운트 1증가
  return cell;
}

const _growthCell = function(){
  // 음식 먹을 때 마다 세포 크기증가 위한 함수
  const cellDom = document.getElementById(this.id);
  this.eatCount += 1; // 세포의 먹음 카운트를 1증가
  this.hunger = cellLifeTime; // 세포의 배고픔 수치 초기화
  this.radius += 1;
  this.width = this.radius * 2;
  this.height = this.radius * 2;
  this.renderX = this.x - this.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  this.renderY = this.y - this.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  cellDom.style.width = `${this.width}px`;
  cellDom.style.height = `${this.height}px`;
}

const _degrowth = function(){
  // 세포 분열시 다시 크기 줄이기 위한 함수
  const cellDom = document.getElementById(this.id);
  this.eatCount = _createCellInfo(3).eatCount; // 세포의 먹음 카운트 초기화
  this.hunger = cellLifeTime; // 세포의 배고픔 수치 초기화
  this.radius = _createCellInfo(3).radius; // 3은 그냥 아무 값 넣은 것
  this.width = this.radius * 2;
  this.height = this.radius * 2;
  this.renderX = this.x - this.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  this.renderY = this.y - this.radius;// 실제 html의 좌표값이 좌측상단 기준이기 때문에 따로 계산
  cellDom.style.width = `${this.width}px`;
  cellDom.style.height = `${this.height}px`;
}

const _randomDefault = (anotherDefault) => {
  // 랜덤으로 0,1,-1 중 하나를 반환해주는 함수
  const allowZero = [0, 1, -1];
  const notZero = [1,-1]
  const result = anotherDefault == 0 ? notZero[Math.floor(Math.random() * notZero.length)] : allowZero[Math.floor(Math.random() * allowZero.length)];
  return anotherDefault == 0 ? result: result;
}

const _cellMove = function ({ x, y }) {
  /*
   x축 이동 픽셀 -1또는 +1값만 넣음
   y축 이동 픽셀 -1또는 +1값만 넣음
   count = 월드시간동안 몇번 이동 될지(월드시간동안 몇픽셀 이동할지) > 등속운동 함
  */
  const cellDom = document.getElementById(this.id); // 렌더링 된 세포
  this.x += x;
  this.y += y;
  this.renderX += x;
  this.renderY += y;
  cellDom.style.left = `${this.renderX}px`;
  cellDom.style.top = `${this.renderY}px`;
}

const _cellPositionSetting = (cellRadius) => {
  /* 세포의 초기 위치를 랜덤하게 지정하기 위한 함수 */
  const mainWrap = document.querySelector("#main");
  const wd = parseInt(mainWrap.clientWidth); //브라우저 너비
  const wh = parseInt(mainWrap.clientHeight); //브라우저 높이
  const limitWd = wd - cellRadius; // x축 한계
  const limitht = wh - cellRadius; // y축 한계
  let x = Math.floor(Math.random() * wd);
  if (x > limitWd) {
    // 랜덤으로 나온 x좌표가 x축 한계 넘을 경우 x좌표를 x축 한계로 지정하여 브라우저 밖으로 나가는 것 방지
    x = limitWd
  }
  let y = Math.floor(Math.random() * wh);
  if (y >= limitht) {
    // 랜덤으로 나온 y좌표가 y축 한계 넘을 경우 y좌표를 y축 한계로 지정하여 브라우저 밖으로 나가는 것 방지
    y = limitht
  }
  return {
    x,
    y
  }
}

const _createCellElement = (id) => {
  // 생성된 세포의 정보를 바탕으로 세포 dom 하나를 생성
  const cell = document.createElement("div");
  const cellInfo = _createCellInfo(id);

  cell.style.cssText = `
  width:${cellInfo.width}px;
  height:${cellInfo.height}px;
  position:absolute;
  left:${cellInfo.renderX}px;
  top:${cellInfo.renderY}px;
  border-radius:${cellInfo.roundness};
  box-shadow: 0px 0px 10px 3px ${cellInfo.color};
  `;
  cell.setAttribute("id", cellInfo.id);
  cell.classList.add(`cell`);
  cellInfos.push(cellInfo); // 세포하나의 데이터 저장
  return cell;
}

const renderCells = (count = 1) => {
  /* 입력된 갯수 만큼 세포를 렌더링함*/
  const main = document.querySelector("#main");
  let cells = [];
  for (let i = 1; i <= count; i++) {
    cells.push(_createCellElement(i));
  }

  cells.forEach((cell, idx) => {
    main.append(cell);
  });
}

const _calcFoodDistance = (Xdistance, Ydistance) => {
  // 절대값으로 변환한 x값의 거리과 y값의 거리로
  // 피타고라스 정리를 이용해서 세포와 음식의 거리를 구함
  return Math.sqrt((Xdistance ** 2) + (Ydistance ** 2));
}

const _findFood = () => {
  // 세포가 더 가까운 음식을 찾게 하기 위한 로직 
  if (foods.length === 0) return; // food가 없으면 함수 종료
  const mainWrap = document.querySelector("#main");
  const wd = parseInt(mainWrap.clientWidth); //브라우저 너비
  const wh = parseInt(mainWrap.clientHeight); //브라우저 높이
  cellInfos.forEach((cell, idx) => {
    let cellX = parseInt(cell.x);
    let cellY = parseInt(cell.y);
    let distances = []; // 각 음식들과의 거리값을 담을 배열
    const cellDOM = document.getElementById(`${cell.id}`); // 렌더링 되어있는 cell dom

    foods.forEach((food, idx) => {
      // 먹이의 위치에서 세포의 현재 위치를 빼서 절대값으로 거리를 구한뒤 x와 y의 거리를 더함
      const Xdistance = Math.abs(food.x - cellX);
      const Ydistance = Math.abs(food.y - cellY);
      const distance = _calcFoodDistance(Xdistance, Ydistance); // 최종 거리
      distances.push({ distance, food });
    });

    distances.sort((a, b) => a.distance - b.distance); // 거리들을 오름차순 정렬을 해서 인덱스 번호0번에 제일 가까운 거리가 오도록 함


    if (cell.detectRadius < distances[0].distance) {
      // 세포의 탐지 반경보다 멀리 있을 시 추적하지 않음
      // 리팩토링 필요 밑의 cellDefaultMove함수와 중복되는 코드임
      const limitWd = wd - cell.radius; // x축 한계
      const limitht = wh - cell.radius; // y축 한계
      // 브라우저 끝에 도달하면 반대방향으로 바꿈===
      if (cell.x < cell.radius) {
        cell.defautX = 1;
      }
      if (cell.y < cell.radius) {
        cell.defautY = 1;
      }
      if (cell.x > limitWd) {
        cell.defautX = -1;
      }
      if (cell.y > limitht) {
        cell.defautY = -1;
      }
      // ============================================
      cell.move({ x: cell.defautX, y: cell.defautY, });
      return;
    }

    if (cellX < distances[0].food.x) {
      // 음식의 x가 세포의 x  보다 크면 세포의 x에 1씩 더함
      cell.move({
        x: 1,
        y: 0,
      });
    }
    if (cellY < distances[0].food.y) {
      // 음식의 y가 세포의 y  보다 크면 세포의 y에 1씩 더함
      cell.move({
        x: 0,
        y: 1,
      });
    }
    if (cellX > distances[0].food.x) {
      // 음식의 x가 세포의 x 보다 작으면 세포의 x에 1씩 뺌
      cell.move({
        x: -1,
        y: 0,
      });
    }
    if (cellY > distances[0].food.y) {
      // 음식의 y가 세포의 y 보다 작으면 세포의 y에 1씩 뺌
      cell.move({
        x: 0,
        y: -1,
      });
    }
  });
}

const _eatingFood = () => {
  // 음식의 좌표와 세포의 좌표를 감시함
  // food들의 좌표와 cell의 좌표를 비교해서 
  // cell의 좌표와 food의 좌표가 같으면 해당 food 데이터를 지우고 cell의 배고픔 수치를 채움
  if (foods.length == 0) return; // 음식 없으면 종료
  //cell과 위치가 겹치는food를 제외한 나머지 food를 넣어서 재정의
  let newFood = [];
  foods.forEach((food) => {
    let isEqual = false;

    // 하나라도 겹치는 게 있으면 food지움
    cellInfos.forEach((cell) => {
      const cellXstart = cell.x - cell.radius; // 세포의 x축 시작 지점
      const cellXend = cell.x + cell.radius; // 세포 x 축 끝지점 
      const cellYstart = cell.y - cell.radius; // 세포의 y축 시작 지점
      const cellYend = cell.y + cell.radius; // 세포 y 축 끝지점
      if(!(cellXstart <= food.x) || !(cellXend >= food.x)) return;
      if(!(cellYstart <= food.y) || !(cellYend >= food.y)) return;
        isEqual = true;
        cell.growth();
    });
    if (isEqual) {
      // 겹친 음식 렌더링된 것 제거
      const deleteFood = document.getElementById(`food-${food.id}`);
      deleteFood.remove();
    }
    if (!isEqual) {
      // 좌표가 cell과 같은 것을 제외한 food들만 다시 배열에 값 넣음
      newFood.push(food);
      return;
    }

  });

  foods = newFood;
}

const _cellDefaultMove = () => {
  // 먹이가 없는 상태 or 세포의 탐지 범위에 먹이가 없을 때 세포의 기본 움직임
  const mainWrap = document.querySelector("#main");
  const wd = parseInt(mainWrap.clientWidth); //브라우저 너비
  const wh = parseInt(mainWrap.clientHeight); //브라우저 높이
  cellInfos.forEach((cell) => {
    const limitWd = wd - cell.radius; // x축 한계
    const limitht = wh - cell.radius; // y축 한계
    // 브라우저 끝에 도달하면 반대방향으로 바꿈===
    if (cell.x < cell.radius) {
      cell.defautX = 1;
    }
    if (cell.y < cell.radius) {
      cell.defautY = 1;
    }
    if (cell.x > limitWd) {
      cell.defautX = -1;
    }
    if (cell.y > limitht) {
      cell.defautY = -1;
    }
    // ============================================
    cell.move({ x: cell.defautX, y: cell.defautY, });
  })
}

const _cellReduceHunger = () => {
  // 세포의 배고픔 수치 차감함
  cellInfos.forEach((cell) => {
    cell.hunger -= worldIntervalTime;
  })
}

const _randomNum = () => {
  return (Math.random() - 0.5) > 0 ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 100) * -1
}

const _cellDead = () => {
  // 세포의 배고픔 수치를 감시하다 배고픔 수치가 0보다 작거나 같아지면 세포를 죽임
  if (cellInfos.length <= 3) {
    // 임시로 해놨지만 세포가 한번에 전부 동시에 죽으면 해결안됨 > 처음 실행하고 먹이 하나도 안주고 가만히 있는 상태인 거임
    cellInfos.forEach((cell) => {
      cell.hunger = cellLifeTime;
    })
    return
  };
  let newCell = [];
  cellInfos.forEach((cell) => {
    if (cell.hunger <= 0) {
      const cellDom = document.getElementById(cell.id);
      cellDom.style.transition = "border 1s ease, box-shadow 1s ease,border 1s ease, opacity 1s ease, top 20s linear, left 20s linear"
      cellDom.style.border = '1px solid #aaa'
      cellDom.style.boxShadow = "";
      cellDom.style.opacity = "0.6";
      cellDom.style.top = `${cell.y + _randomNum()}px`;
      cellDom.style.left = `${cell.x + _randomNum()}px`;
      cellDom.setAttribute("id", `dead-${cell.id}`);
      setTimeout(() => {
        cellDom.style.opacity = "0";
        setTimeout(() => {
          cellDom.remove();
        }, 2000);
      }, 20000)
      return;
    };
    newCell.push(cell);
  })
  cellInfos = newCell;
}

const _cellCollisionDetection = () => {
  // 세포간 충돌감지
  let newCell = [...cellInfos];
  const main = document.getElementById("main");
  const wd = parseInt(main.clientWidth);
  const wh = parseInt(main.clientHeight);
  cellInfos.forEach((cell) => {
    const cellXrange = cell.x + cell.radius // cell의 x범위
    const cellYrange = cell.y + cell.radius // cell y축 범위
    newCell.forEach((anotherCell) => {
      if(cell.id == anotherCell.id) return; // 자신을 제외
      let overlapX = false;
      let overlapY = false;
      if ((cell.x - cell.radius <= anotherCell.x) && (cellXrange >= anotherCell.x)){ overlapX = true};
      if ((cell.y - cell.radius <= anotherCell.y) && (cellYrange >= anotherCell.y)){ overlapY = true};

      if (!overlapX || !overlapY) return;
      cell.defautX *= -1;
      cell.defautY *= -1;
      if (cell.x <= anotherCell.x) {
        cell.move({
          x: -1,
          y: 0,
        });
      }
      if(cell.y <= anotherCell.y){
        cell.move({
          x:0,
          y:-1,
        })
      }
      if(cell.x >= anotherCell.x){
        cell.move({
          x:1,
          y:0,
        })
      }
      if(cell.y >= anotherCell.y){
        cell.move({
          x:0,
          y:1,
        })
      }
      // 충돌 때매 밀려나도 브라우저 밖으로 나가면 반대방향으로 이동시킴
      if(cell.x >= wd - cell.radius){
        cell.move({
          x : -1,
          y : 0
        })
      }
      if(cell.y >= wh - cell.radius){
        cell.move({
          x : 0,
          y : -1
        })
      }
      if(cell.x <= cell.radius){
        cell.move({
          x : 1,
          y : 0
        })
      }
      if(cell.y <= cell.radius){
        cell.move({
          x : 0,
          y : 1
        })
      }
    });

    // if (isOverLap) {
    //   // cell.move();
    // }
  });
}

const _cellDivision =()=>{
  // 음식 섭취 감시 함수 바로 뒤에 작성되어야함
  // 세포들의 음식 섭취 카운트를 감지해서 몇 개 이상 섭취 시 카운트를 초기화하고
  // 모든 속성을 복사받은 또다른 세포를 복사시킴
  const divisionConditionCount = 5; // 분열 조건 충족 갯수
  let childCells = []; // 복사(유전)된 세포들을 담을 배열
  cellInfos.forEach((cell)=>{
    if(cell.eatCount >= divisionConditionCount){
      cell.deGrowth();
      let child = {...cell};
      child.id = cellIdCount;
      child.hunger = cellLifeTime;
      child.defautX = _randomDefault(); 
      child.defautY = _randomDefault(child.defautX);
      childCells.push(child);
      cellIdCount++;
    }
  });

  childCells.forEach((child)=>{
    cellInfos.push(child);
    _renderChildCell(child);
  });
}

const _renderChildCell = (child)=>{
  const main = document.getElementById("main");
  // 자식 세포 렌더링 함수
  const cell = document.createElement("div");
  cell.style.cssText = `
  width:${child.width}px;
  height:${child.height}px;
  position:absolute;
  left:${child.renderX}px;
  top:${child.renderY}px;
  border-radius:${child.roundness};
  box-shadow: 0px 0px 10px 3px ${child.color};
  `;
  cell.setAttribute("id", child.id);
  cell.classList.add(`cell`);
  main.append(cell);
}

const _cellActive = () => {
  // 세포의 활동 실행 함수
  const duringTime = worldIntervalTime / cellSpeed; // 단위 시간 
  for (let i = 0; i <= cellSpeed + 1; i++) {
    // 월드타임간격 당 cellSpeed 횟수만큼 실행함
    setTimeout(() => {
      if (foods.length == 0) {
        // 음식이 없을 경우에만 실행
        _cellDefaultMove();
      }
      _findFood(); // 음식을 찾아 움직임
      _eatingFood(); // 음식을 먹었는지 안먹었는지 감시
      _cellDivision(); // 세포의 음식 카운트를 감시하여 분열 결정하는 함수
      _cellCollisionDetection(); // 세포들의 충돌 감지
    }, duringTime * i);
  }
  // =====이쪽은 월드 인터벌 타임당 한번씩 실행할 함수들
  _cellReduceHunger();
  _cellDead();
}

const _randomFoodSupply = ()=>{
  // 랜덤으로 음식을 뿌려줄 타이머 함수 세팅
  if(randomFood != null) return; // 이미 타이머가 작동중이면 함수 종료
  _addFood(null,true);
  randomFood = setTimeout(()=>{
    clearTimeout(randomFood);
    randomFood = null;
  },10000);
}

const worldTimer = () => {
  // 세계 시간 진행

  setInterval(() => {
    _cellActive();
    _randomFoodSupply();
  }, worldIntervalTime);
}


const commonLogic = {
  renderCells,
  setEvent,
  worldTimer,
}

export { commonLogic };