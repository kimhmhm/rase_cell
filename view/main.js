import {commonLogic as logic} from "../logic/common.js";


const init = ()=>{
  // 시작 함수
  logic.renderCells(15);
  logic.setEvent();
  logic.worldTimer();
}

init();
