let categorysel = document.getElementById("categoryselect");
let karlsonScores;
let scoreTimeout = 60000*60; //1min x 60


class Player{
    constructor(name,category){
        this.name=name;
        this.category=category;
        this.fullgame=null;
        this.level=null;
        this.total=null;
    }
}

{
    let karlsonScores_temp = localStorage.getItem("karlsonScores");
    if(karlsonScores_temp==null){
        karlsonScores_temp = {
            version:1,
            selcat:"any",
            cats:{
                any:[],
                ae:[],
                gunless:[],
            },
            nextUpdate:Date.now(),
            community:{
                any:new Player("community","any"),
                ae:new Player("community","ae"),
                gunless:new Player("community","gunless"),
            }
        };
        saveKarlsonScores(karlsonScores_temp);
        karlsonScores=karlsonScores_temp
    }else{
        karlsonScores=JSON.parse(karlsonScores_temp);
    }
}
let timeManager = new TimeManager();

checkUpdate();
setInterval(checkUpdate,1000);
function checkUpdate(){
    if(Date.now()>=karlsonScores.nextUpdate){
        karlsonScores.nextUpdate=Date.now()+scoreTimeout;
        updateScores();
    }
}


//select category
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
    karlsonScores.selcat=self.getAttribute("data-category");
    saveKarlsonScores();
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
    
    let newPlayer = new Player(addPlayerInput.value,karlsonScores.selcat);
    for(let player of karlsonScores.cats[karlsonScores.selcat]){
        if(player.name===newPlayer.name){
            addPlayerInput.value="";
            return;
        };
    }

    addPlayerBtn.disabled=true;
    timeManager.getPlayerData(newPlayer.name,data=>{
        karlsonScores.cats[newPlayer.category].push(newPlayer);
        calculateScores(newPlayer,data);
        saveKarlsonScores();
        updateTable();
        addPlayerBtn.disabled=false;
    },error=>{
        addPlayerBtn.disabled=false;
        console.log(error);
    });

    addPlayerInput.value="";
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
        scoretable.appendChild(tr);
    }

}

function saveKarlsonScores(data=karlsonScores){
    localStorage.setItem("karlsonScores",JSON.stringify(data));
}

function calculateScores(player,data){
    let levelcount = 0;
    let totalleveltimes = 0;
    for(let time in data.cats.level[player.category]){
        let leveltime = data.cats.level[player.category][time];
        if(leveltime==null)continue;
        levelcount++;
        totalleveltimes+=leveltime;
    }
    if(levelcount==11){
        player.level=((karlsonScores.community[player.category].level/totalleveltimes)*100).toFixed(2);
    }else{
        totalleveltimes=null;
    }
    
    if(data.cats.fullgame[player.category]!=null){
        player.fullgame=((karlsonScores.community[player.category].fullgame/data.cats.fullgame[player.category])*100).toFixed(2);
    }

    if(levelcount==11&&data.cats.fullgame[player.category]!=null){
        player.total=((karlsonScores.community[player.category].total/(data.cats.fullgame[player.category]*totalleveltimes))*100).toFixed(2);
    }

}

function calculateCommunityScores(player,data){

    let totalleveltimes = 0;
    for(let time in data.cats.level[player.category]){
        totalleveltimes+=data.cats.level[player.category][time];
    }
    player.level=totalleveltimes.toFixed(2);
    player.fullgame=data.cats.fullgame[player.category].toFixed(2);
    player.total=(totalleveltimes*data.cats.fullgame[player.category]).toFixed(2);
}

function updateScores(){
    timeManager.getCommunityData(data=>{
        updateCommunityScores(data);
        updatePlayerScores();
        saveKarlsonScores();
    },error=>{
        console.log(error);
        console.log("This is some serious Error my dude");
    });
}

function updateCommunityScores(data){
    calculateCommunityScores(karlsonScores.community.any,data);
    calculateCommunityScores(karlsonScores.community.ae,data);
    calculateCommunityScores(karlsonScores.community.gunless,data);
}

function updatePlayerScores(){

    // this completly ignores the possible timeout by the speedrun.com api

    updatePlayerScoresList(karlsonScores.cats.any);
    updatePlayerScoresList(karlsonScores.cats.ae);
    updatePlayerScoresList(karlsonScores.cats.gunless);
}

function updatePlayerScoresList(playerlist,num=0){
    if(num>playerlist.length)return;
    let player = playerlist[num];
    if(player==null)return;

    timeManager.getPlayerData(player.name,data=>{
        calculateScores(player,data);
        updatePlayerScoresList(playerlist,num+1);
    },error=>{
        console.log(error);
    });
}