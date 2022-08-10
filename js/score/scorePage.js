let karlsonScores = new KarlsonScores();
let timeManager = new TimeManager();

karlsonScores.startUpdateCheck(updateScores);

//select category
let categorysel = document.getElementById("categoryselect");

for (let i = 0; i < categorysel.children.length; i++) {
    if(categorysel.children[i].getAttribute("data-category")===karlsonScores.selcat){
        selectCategory(categorysel.children[i]);
        break;
    }
}

function selectCategory(self){
    for (let i = 0; i < categorysel.children.length; i++) {
        categorysel.children[i].classList.remove("selected");
    }
    self.classList.add("selected");
    karlsonScores.changeSelCat(self.getAttribute("data-category"));
    updateTable();
}


//input box enter to click btn
document.getElementById("addPlayerInput").addEventListener("keydown",e=>{
    if(e.key==="Enter")document.getElementById("addPlayerBtn").click();
});

function addPlayer(){
    let addPlayerInput = document.getElementById("addPlayerInput");
    let addPlayerBtn = document.getElementById("addPlayerBtn");
    addPlayerInput.value=addPlayerInput.value.trim();
    if(addPlayerInput.value=="")return;
    
    addPlayerBtn.disabled=true;
    karlsonScores.addPlayer(new Player(addPlayerInput.value,karlsonScores.selcat)
    ,()=>{
        updateTable();
        addPlayerBtn.disabled=false;
    },error=>{
        addPlayerBtn.disabled=false;
        console.error(error);
    });

    addPlayerInput.value="";
}

function updateScores(){
    karlsonScores.updateScores(()=>{
        updateTable();
    },error=>{
        console.error(error);
    });
}

function updateTable(){
    let scoretable = document.getElementById("scoretable");
    
    while (scoretable.hasChildNodes()) {
        scoretable.removeChild(scoretable.firstChild);
    }

    for(let player of karlsonScores.cats[karlsonScores.selcat]){
        let tr = document.createElement("tr");
        let mx=0;

        for(let i = 0;i<4;i++){
            let td = document.createElement("td");
            td.draggable=false;
            switch(i){
                case 0:
                    td.innerText=player.name;
                    break;
                case 1:
                    td.innerText=player.fullgame??"-";
                    break;
                case 2:
                    td.innerText=player.level??"-";   
                    break;
                case 3:
                    td.innerText=player.total??"-";
                    break;
            }
            tr.appendChild(td);
        }

        //delete function
        tr.addEventListener("mousedown",e=>{
            addEventListener("mousemove",movePlayerEle);
            addEventListener("mouseup",()=>{
                removeEventListener("mousemove",movePlayerEle);
                if(Math.abs(mx)>200){
                    karlsonScores.removePlayer(player.name);
                    updateTable();
                }else{
                    mx=0;
                    tr.style.transform="translateX(0px)";
                    tr.style.opacity=1;
                }
            },{once:true})

            function movePlayerEle(e){
                tr.style.transform="translateX("+(mx+=e.movementX)+"px)";
                tr.style.opacity=1/(Math.abs(mx)/50);
            }
        });

        
        scoretable.appendChild(tr);
    }

}
