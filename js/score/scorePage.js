let karlsonScores = new KarlsonScores();
let karlsonTimes = new KarlsonTimes();

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
    e.target.value=e.target.value.trim();
    if(e.target.value=="")return;
    if(e.key==="Enter")document.getElementById("addPlayerBtn").click();
});

document.getElementById("addTopPlayersBtn").disabled=true;
document.getElementById("addTopPlayersInput").value="";
document.getElementById("addTopPlayersInput").oninput=e=>{
    let btn = document.getElementById("addTopPlayersBtn");
    if(e.target.value<1){
        e.target.value="";
        btn.disabled=true;
    }else if(e.target.value>50){
        e.target.value=50;
    }else{
        btn.disabled=false;
    }
}
function addTopPlayers(self){
    let addTopPlayersInput = document.getElementById("addTopPlayersInput");
    let progress = document.getElementById("progress");
    progress.max=addTopPlayersInput.value;
    progress.style.display="block";
    progress.value=0;
    let counter = new Counter(()=>{
        progress.value=counter.count;
    });
    self.disabled=true;
    karlsonScores.addTopPlayers(addTopPlayersInput.value,()=>{
        self.disabled=false;
        progress.style.display="none";
        updateTable();
    },error=>{
        self.disabled=false;
        progress.style.display="none";
        console.error(error);
    },{category:karlsonScores.selcat,counter:counter});
}


function addPlayer(self){
    let addPlayerInput = document.getElementById("addPlayerInput");
    
    self.disabled=true;
    karlsonScores.addPlayer(addPlayerInput.value,()=>{
        self.disabled=false;
        updateTable();
    },error=>{
        self.disabled=false;
        console.error(error);
    });

    addPlayerInput.value="";
}

function updateScores(self=null){
    let progress = document.getElementById("progress");
    progress.max=karlsonScores.cats.any.length+karlsonScores.cats.ae.length+karlsonScores.cats.gunless.length;
    progress.style.display="block";
    progress.value=0;
    let counter = new Counter(()=>{
        progress.value=counter.count;
    });

    if(self!=null){
        self.disabled=true;
    }

    karlsonScores.updateScores(()=>{
        progress.style.display="none";
        if(self!=null){
            self.disabled=false;
        }
        updateTable();
    },error=>{
        progress.style.display="none";
        if(self!=null){
            self.disabled=false;
        }
        console.error(error);
    },counter);
}

document.querySelectorAll(".sorter").forEach(e=>{
    if(e.parentElement.getAttribute("data-sort")==karlsonScores.sortOption.mode){
        e.setAttribute("data-sort",karlsonScores.sortOption.order);
    }
});

function sortTable(self){
    for (let i = 0; i < self.parentElement.children.length; i++) {
        if(self.parentElement.children[i]==self)continue;
        self.parentElement.children[i].lastElementChild.setAttribute("data-sort","none");
    }

    let sortmodeEle = self.lastElementChild; 
    switch(sortmodeEle.getAttribute("data-sort")){
        case "none":
            sortmodeEle.setAttribute("data-sort","asc");
            break;
        case "asc":
            sortmodeEle.setAttribute("data-sort","desc");
            break;
        case "desc":
            sortmodeEle.setAttribute("data-sort","asc");
            break;
    }

    karlsonScores.sortData(self.getAttribute("data-sort"),sortmodeEle.getAttribute("data-sort"));
    updateTable();
}

function updateTable(){
    let scoretable = document.getElementById("scoretable");
    
    while (scoretable.hasChildNodes()) {
        scoretable.removeChild(scoretable.firstChild);
    }

    for(let player of karlsonScores.cats[karlsonScores.selcat]){
        let tr = document.createElement("tr");
        

        for(let i = 0;i<4;i++){
            let td = document.createElement("td");
            let link = document.createElement("a");
            td.appendChild(link);
            link.draggable=false;
            switch(i){
                case 0:
                    link.innerText=player.name;
                    link.href="https://www.speedrun.com/user/"+player.name;
                    link.title=player.name;
                    break;
                case 1:
                    link.innerText=player.fullgame??"-";
                    break;
                case 2:
                    link.innerText=player.level??"-"; 
                    break;
                case 3:
                    link.innerText=player.total??"-";
                    break;
            }
            tr.appendChild(td);
        }

        //delete function
        tr.addEventListener("mousedown",e=>{
            let mx=0;
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
                mx+=e.movementX
                tr.style.transform="translateX("+(mx)+"px)";
                tr.style.opacity=1/(Math.abs(mx)/50);
            }
        });

        //delete mobile
        tr.addEventListener("touchstart",e=>{
            let lastmposx = null; 
            let mx=0;
            addEventListener("touchmove",movePlayerEle);
            addEventListener("touchend",()=>{
                removeEventListener("touchmove",movePlayerEle);
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
                if(lastmposx==null)lastmposx=e.touches[0].clientX;
                
                mx+=e.touches[0].clientX-lastmposx;
                lastmposx=e.touches[0].clientX;
                if(Math.abs(mx)>10){
                    tr.style.transform="translateX("+(mx)+"px)";
                    tr.style.opacity=1/(Math.abs(mx)/50);
                }
            }
        });

        
        scoretable.appendChild(tr);
    }

}
