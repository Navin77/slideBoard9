const initialPg = document.querySelector("#AppLoadPage")
const authPg1 = document.querySelector("#authorPage1")
const otherPg1 = document.querySelector("#otherPage1")
const pg2 = document.querySelector("#page2")
const gameStartBtn = document.querySelector("#gameStartBtn")
const gTimeLimit = document.querySelector("#gTimeLimit")
const gTimeLimitt = document.querySelector("#gTimeLimitt")
const movesDisplay = document.querySelectorAll(".isMoveLimited")
const gMoveLimit = document.querySelector("#gMoveLimit")
const gMoveLimitt = document.querySelector("#gMoveLimitt")
const wonDisp = document.querySelector("#wonDisp")
const tblCont = document.querySelector(".leadersCont")

var wonTim = ""
var wonMov = ""
var givenMov = ""
var gamePrepareDat;
var isMoveLimited = false;
var lockGBoard = false;
var isGameStarted = false;




////////////////reddit code///////

window.addEventListener("message", (ev)=>{
  const { type, data } = ev.data;

  if (type === 'devvit-message') {
    const { message } = data;

    switch (message.type) { 
      case "initial": {
          if (message.data.usrName == message.data.authorName) {
            
            window.parent?.postMessage({
                type: "whatPageAuthor",
                data: {}
              },'*')
          } else {
            
            window.parent?.postMessage({
              type: "whatPageOther",
              data: {}
            }, '*')
          }
        }
        break;
      case "AnspageAuthor": {
        if(message.data == "1") {
          //show page 1
          initialPg.setAttribute("class", "hide")
          otherPg1.setAttribute("class", "hide")
          pg2.setAttribute("class", "hide")
          authPg1.setAttribute("class", "")
        } else {
          gamePrepareDat = message
          prepareGame()          
          lockGBoard = true
          isGameStarted = true
          gameStartBtn.setAttribute("class", "notAllowed")

          fillLeaderBoard(message.data[3],[])
          
          initialPg.setAttribute("class", "hide")
          otherPg1.setAttribute("class", "hide")
          authPg1.setAttribute("class", "hide")
          pg2.setAttribute("class", "")
        }
      }
      break;
      case "AnspageOther": {
        if(message.data == "1") {
          //show page 1
          initialPg.setAttribute("class", "hide")
          authPg1.setAttribute("class", "hide")
          pg2.setAttribute("class", "hide")
          otherPg1.setAttribute("class", "")

        } else {
          gamePrepareDat = message
          prepareGame()

          if(message.data[3] == "true")
          {
            gameStartBtn.textContent = "Completed"
            gameStartBtn.setAttribute("class", "notAllowed")
            lockGBoard = true
            isGameStarted = true
            wonDisp.removeAttribute("class")            
          }

          fillLeaderBoard(message.data[4], message.data[5])

          initialPg.setAttribute("class", "hide")
          otherPg1.setAttribute("class", "hide")
          authPg1.setAttribute("class", "hide")
          pg2.setAttribute("class", "")
        }
      }
      break;
      case "afterWonScores": {
        while (tblCont.firstChild) {
          tblCont.removeChild(tblCont.lastChild);
        }
        fillLeaderBoard(message.data[0], message.data[1])
        if(isMoveLimited)
          document.querySelector(".gameLostMsg").textContent = `solved in ${wonTim} with ${wonMov} moves`
        else
          document.querySelector(".gameLostMsg").textContent = `solved in ${wonTim}`

        leaderBoard.removeAttribute("class")
      }
      break;
      default:
        break;
    }

  }

})

//////////////authorPage1//////////////////////////

const gBox9 = document.querySelector("#b9");
const moveMade = document.querySelectorAll(".authMoves");
const puzzNxtBtn = document.querySelector(".puzzNxtBtn")
const secondStep = document.querySelector("#gConfigs")
const pleaseErr = document.querySelector("#pleaseErr")
const createPuzzBtn = document.querySelector("#createPuzzBtn");
const minuteInput = document.querySelector("#minuteConstraint")
const secondsInput = document.querySelector("#secondsConstraint")
const movesChkbox = document.querySelector("#movesConstraint")
const movesInput = document.querySelector("#mConsInput")
const minErrMsg = document.querySelector("#minErrMsg")
const secErrMsg = document.querySelector("#secErrMsg")
const movErrMsg = document.querySelector("#movErrMsg")


const defaultPos = [
  "r1 c1", "r1 c2", "r1 c3",
  "r2 c1", "r2 c2", "r2 c3",
  "r3 c1", "r3 c2", "r3 c3"
]


const chkAndMove = (e) => {
  var curR = Number(e.target.getAttribute("class")[1]);
  var curC = Number(e.target.getAttribute("class")[4]);
  var eR = Number(gBox9.getAttribute("class")[1]);
  var eC = Number(gBox9.getAttribute("class")[4]);

  //if empty is in same row
  if (eR == curR) {
    if (eC == curC - 1) {
      e.target.setAttribute("class", `r${eR} c${eC}`)
      gBox9.setAttribute("class", `r${curR} c${curC}`)
      moveMade.forEach(e => {
        e.textContent = Number(e.textContent) + 1
      })
      movesInput.setAttribute("min", moveMade[0].textContent)
      return
    }
    if (eC == curC + 1) {
      e.target.setAttribute("class", `r${eR} c${eC}`)
      gBox9.setAttribute("class", `r${curR} c${curC}`)
      moveMade.forEach(e => {
        e.textContent = Number(e.textContent) + 1
      })
      movesInput.setAttribute("min", moveMade[0].textContent)
      return
    }
  }


  //if empty is in same column
  if (eC == curC) {
    if (eR == curR - 1) {
      e.target.setAttribute("class", `r${eR} c${eC}`)
      gBox9.setAttribute("class", `r${curR} c${curC}`)
      moveMade.forEach(e => {
        e.textContent = Number(e.textContent) + 1
      })
      movesInput.setAttribute("min", moveMade[0].textContent)
      return
    }
    if (eR == curR + 1) {
      e.target.setAttribute("class", `r${eR} c${eC}`)
      gBox9.setAttribute("class", `r${curR} c${curC}`)
      moveMade.forEach(e => {
        e.textContent = Number(e.textContent) + 1
      })
      movesInput.setAttribute("min", moveMade[0].textContent)
      return
    }
  }


};

for (let i = 1; i < 9; i++) {
  document.querySelector(`#b${i}`).addEventListener("click", chkAndMove)
}


var moveConstraint = document.querySelector("#movesConstraint")
moveConstraint.addEventListener("click", () => {
  let elem = document.querySelector("#movesInputCont")

  if (moveConstraint.checked == true) {
    elem.setAttribute("class", "")
    movesInput.setAttribute("required", "")
  } else {
    elem.setAttribute("class", "hide")
    movesInput.removeAttribute("required")
  }
})

let resetBtn = document.querySelector(".resetMoves");
resetBtn.addEventListener("click", () => {
  for (let i = 0; i < 9; i++) {
    document.querySelector(`#b${i + 1}`).setAttribute("class", `${defaultPos[i]}`)
  }
  moveMade.forEach(e => {
    e.textContent = "0"
  });
  movesInput.setAttribute("min", 0)
  secondStep.setAttribute("class", "hide");
})

puzzNxtBtn.addEventListener("click", () => {
  if (moveMade[0].textContent != "0") {
    minuteInput.removeAttribute("class")
    secondStep.removeAttribute("class");
  } else {
    showPlsErr()
  }
})

function showPlsErr() {
  pleaseErr.classList.remove("hide");
  setTimeout(() => {
    pleaseErr.classList.add("hide")
  }, 2000)
}

createPuzzBtn.addEventListener("click", ()=>{
  let sqPos = ""
  let time = ""
  let move = "0"
  let isErr = false;

  minErrMsg.textContent = ""
  secErrMsg.textContent = ""
  movErrMsg.textContent = ""
  minuteInput.removeAttribute("class")
  secondsInput.removeAttribute("class")
  movesInput.removeAttribute("class")


  if (isNaN(minuteInput.value)) {
    minuteInput.setAttribute("class", "errInput")
    minErrMsg.textContent = "enter numbers only"
    isErr = true;
  } else if (minuteInput.value < 0) {
    minuteInput.setAttribute("class", "errInput")
    minErrMsg.textContent = "enter positive value"
    isErr = true;
  } else if (minuteInput.value > 5) {
    minuteInput.setAttribute("class", "errInput")
    minErrMsg.textContent = "enter value less than 6"
    isErr = true;
  } else if (minuteInput.value == 0 || minuteInput.value == "") {
    if (secondsInput.value == "") {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter a value"
      isErr = true;

    } else if (isNaN(secondsInput.value)) {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter numbers only"
      isErr = true;

    } else if (secondsInput.value < 10) {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter value greater than 9"
      isErr = true;

    } else if (secondsInput.value > 59) {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter value less than 60"
      isErr = true;

    }
  } else {
    if (secondsInput.value < 0) {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter positive value"
      isErr = true;

    } else if (secondsInput.value > 59) {
      secondsInput.setAttribute("class", "errInput")
      secErrMsg.textContent = "enter value less than 60"
      isErr = true;

    }
  }

  if (movesChkbox.checked) {
    if (movesInput.value == "") {
      movesInput.setAttribute("class", "errInput")
      movErrMsg.textContent = "enter a value"
      isErr = true;
    } else if (isNaN(movesInput.value)) {
      movesInput.setAttribute("class", "errInput")
      movErrMsg.textContent = "enter numbers only"
      isErr = true;

    } else if (movesInput.value < Number(moveMade[0].textContent)) {
      movesInput.setAttribute("class", "errInput")
      movErrMsg.textContent = `enter a value greater than ${Number(moveMade[0].textContent)-1}`;
      isErr = true;
    }
  }

  if (!isErr) {

  for (let i = 1; i < 10; i++) {
    sqPos += `${document.querySelector(`#b${i}`).getAttribute("class")},`
  }

    if(secondsInput.value < 10)
      time = `${minuteInput.value}:0${secondsInput.value}`
    else
      time = `${minuteInput.value}:${secondsInput.value}`

    if (movesChkbox.checked)
     move = movesInput.value

  window.parent?.postMessage({
    type: "storePuzData",
    data: { posd: sqPos, timed: time, moved: move }
  }, '*')
  }

})

//////////////Page2/////////////////////////////////////

const guBox9 = document.querySelector("#bu9");
var countDowntimeIntervalId;
const leaderBoard = document.querySelector("#leaderBoard")
const closeBtn = document.querySelector(".closeBtn")



const chkAndMove2 = (e) => {
  if (!lockGBoard) {
    var curR = Number(e.target.getAttribute("class")[1]);
    var curC = Number(e.target.getAttribute("class")[4]);
    var eR = Number(guBox9.getAttribute("class")[1]);
    var eC = Number(guBox9.getAttribute("class")[4]);

    //if empty is in same row
    if (eR == curR) {
      if (eC == curC - 1) {
        chkAndStartGame()
        e.target.setAttribute("class", `r${eR} c${eC}`)
        guBox9.setAttribute("class", `r${curR} c${curC}`)
        chkWon()
        chkAndDecreaseMove()
        return
      }
      if (eC == curC + 1) {
        chkAndStartGame()
        e.target.setAttribute("class", `r${eR} c${eC}`)
        guBox9.setAttribute("class", `r${curR} c${curC}`)
        chkWon()
        chkAndDecreaseMove()
        return
      }
    }


    //if empty is in same column
    if (eC == curC) {
      if (eR == curR - 1) {
        chkAndStartGame()
        e.target.setAttribute("class", `r${eR} c${eC}`)
        guBox9.setAttribute("class", `r${curR} c${curC}`)
        chkWon()
        chkAndDecreaseMove()
        return
      }
      if (eR == curR + 1) {
        chkAndStartGame()
        e.target.setAttribute("class", `r${eR} c${eC}`)
        guBox9.setAttribute("class", `r${curR} c${curC}`)
        chkWon()
        chkAndDecreaseMove()
        return
      }
    }
  }

};

for (let i = 1; i < 9; i++) {
  document.querySelector(`#bu${i}`).addEventListener("click", chkAndMove2)
}

function decreaseTimeByOneSec(timeString) {
  let sec = Number(timeString.slice(-2));
  let min = Number(timeString[0])
  if (sec == 0) {
    sec = "59"
    --min;
  } else {
    --sec
    if (sec < 10) sec = `0${sec}`
  }
  return `${min}:${sec}`
}

function startCountdown() {
  countDowntimeIntervalId = setInterval(() => {
    let now = decreaseTimeByOneSec(gTimeLimit.textContent)
    gTimeLimit.textContent = now;
    if (now == "0:00") {
      clearInterval(countDowntimeIntervalId);
      document.querySelector(".gameLostMsg").textContent = "Lost (time over)"
      leaderBoard.removeAttribute("class")
      prepareGame()
      isGameStarted = false
    }
  }, 1000);
}

function chkAndStartGame() {
  if (!isGameStarted) {
    isGameStarted = true;
    startCountdown();
  }
}

function chkAndDecreaseMove() {
  if (isMoveLimited) {
    gMoveLimit.textContent = Number(gMoveLimit.textContent) - 1
    if (gMoveLimit.textContent == "0") {
      if (gameStartBtn.textContent != "Completed")
      {
      clearInterval(countDowntimeIntervalId)
      document.querySelector(".gameLostMsg").textContent = "Lost (moves over)"
      leaderBoard.removeAttribute("class")
      prepareGame()
      isGameStarted = false
      }
    }
  }
}

function chkWon() {
  for (let i = 1; i < 10; i++) {
    let pos = document.querySelector(`#bu${i}`).getAttribute("class")
    if (pos != defaultPos[i - 1]) return
  }
  clearInterval(countDowntimeIntervalId);
  gameStartBtn.textContent = "Completed"
  gameStartBtn.setAttribute("class", "notAllowed")
  wonDisp.removeAttribute("class")
  lockGBoard = true
  isGameStarted = true
  wonTim = gTimeLimit.textContent
  if(isMoveLimited) wonMov =  `${Number(givenMov) - (Number(gMoveLimit.textContent)-1)}`
  window.parent?.postMessage({
    type: "won",
    data: {}
  }, '*')
}

gameStartBtn.addEventListener("click", () => {
  if(gameStartBtn.textContent == "start")
  {
    chkAndStartGame()
  }
})

document.querySelector(".leaderBoardBtn").addEventListener("click", ()=>{
  leaderBoard.removeAttribute("class")
})


function prepareGame() {
  //arrange pos
  let posd = gamePrepareDat.data[0].split(",")
  for (let i = 1; i < 10; i++) {
    document.querySelector(`#bu${i}`).setAttribute("class", posd[i - 1])
  }
 
  //set timeLimit
  gTimeLimit.textContent = gamePrepareDat.data[1];
  gTimeLimitt.textContent = gamePrepareDat.data[1];

  //chk & set move limit
  if (gamePrepareDat.data[2] != "0") {
    movesDisplay.forEach((e) => {
      e.classList.remove("hide");
    })
    gMoveLimit.textContent = gamePrepareDat.data[2]
    gMoveLimitt.textContent = gamePrepareDat.data[2]
    givenMov = gamePrepareDat.data[2]
    isMoveLimited = true
  }
}

closeBtn.addEventListener("click", () => {
  leaderBoard.setAttribute("class", "hide")
})

function fillLeaderBoard(tblDat, uTblDat) {

  if(tblDat.length)
  {
  if (uTblDat.length) {
    var tbl = document.createElement("table")
    tbl.setAttribute("class", "usrPointsTbl")
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.textContent = tblDat[0]
    var td2 = document.createElement("td");
    td2.setAttribute("class", "pointsCol")
    td2.textContent = tblDat[1]
    tr.appendChild(td1)
    tr.appendChild(td2)
    tbl.appendChild(tr)
    tblCont.appendChild(tbl)
  }

  var tbl = document.createElement("table")
  tbl.setAttribute("class", "pointsTbl")
  for (let i = 0; i < tblDat.length; i = i + 2) {
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.textContent = tblDat[i]
    var td2 = document.createElement("td");
    td2.setAttribute("class", "pointsCol")
    td2.textContent = tblDat[i + 1]
    tr.appendChild(td1)
    tr.appendChild(td2)
    tbl.appendChild(tr)
  }
  tblCont.appendChild(tbl)
}
}