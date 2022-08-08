let players = [];
let ids={
    karlson: "m1zjg926",
    cat:{
        any_full:"wk6n5xx2",
        ae_full:"7kj3ejx2",
        gunless_full:"jdrv5jx2",
        any_il:"z27rq8gd",
        ae_il:"zdn0jeq2",
        gunless_il:"xk9royyk",
    },
    lvl:{
        tut:"xd03lrmd",
        sand0:"rw6erppd",
        sand1:"n93yn22d",
        sand2:"z98gz2rw",
        esc0:"rdn2lk5d",
        esc1:"ldy854pw",
        esc2:"gdr18kew",
        esc3:"nwlpyko9",
        sky0:"ywemjzld",
        sky1:"69znqmx9",
        sky2:"r9g1jkj9",
    },
}

// personal bests "https://www.speedrun.com/api/v1/users/ {user} /personal-bests?game=m1zjg926",

let categorysel = document.getElementById("categoryselect");
selectCategory(categorysel.children[0]);

function selectCategory(self){
    for (let i = 0; i < categorysel.children.length; i++) {
        categorysel.children[i].classList.remove("selected");
    }
    self.classList.add("selected");
    players=[];
    //update players
    console.log(self.getAttribute("data-category"));
}


//input box enter to click btn
document.getElementById("addPlayerInput").addEventListener("keydown",e=>{
    if(e.key==="Enter")document.getElementById("addPlayerBtn").click();
});

function addPlayer(){
    let addPlayerInput = document.getElementById("addPlayerInput");
    addPlayerInput.value=addPlayerInput.value.trim();
    if(addPlayerInput.value=="")return;

    players.push(addPlayerInput.value);
    updateTable();

    addPlayerInput.value="";
}

function updateTable(){
    let scoretable = document.getElementById("scoretable");
    
    while (scoretable.hasChildNodes()) {
        scoretable.removeChild(scoretable.firstChild);
    }

    for(let player of players){
        let tr = document.createElement("tr");
        for(let i = 0;i<4;i++){
            let td = document.createElement("td");
            switch(i){
                case 0:
                    td.innerText=player;
                    break;
                default:
                    td.innerText="-";
                    break;
            }
            tr.appendChild(td);
        }
        scoretable.appendChild(tr);
    }
    
    

}