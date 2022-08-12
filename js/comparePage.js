let player1Input = document.getElementById("player1");
let player2Input = document.getElementById("player2");
karlsonTimes = new KarlsonTimes();
let playerdata={player1:null,player2:null,category:"any"};
selectCategory();

function comparePlayerChange(){
    player1Input.value=player1Input.value.trim();
    player2Input.value=player2Input.value.trim();

    if(player1Input.value!=""&&player2Input.value!=""){
        karlsonTimes.getPlayerData(player1Input.value,player1data=>{
            karlsonTimes.getPlayerData(player2Input.value,player2data=>{
                createCompareTable(player1data,player2data);
            },error=>{
                player2Input.value="";
                console.error(error);
            })
        },error=>{
            player1Input.value="";
            console.error(error);
        })
    }
}

function selectCategory(self=document.getElementById("categoryselect").firstElementChild){
    let categorysel = document.getElementById("categoryselect");

    for (let i = 0; i < categorysel.children.length; i++) {
        categorysel.children[i].classList.remove("selected");
    }
    self.classList.add("selected");
    playerdata.category = self.getAttribute("data-category");
    createCompareTable();
}

function createCompareTable(player1=playerdata.player1,player2=playerdata.player2){
    if(player1==null&&player2==null)return;
    playerdata.player1=player1;
    playerdata.player2=player2;
    let comparetable = document.getElementById("comparetable");

    while (comparetable.hasChildNodes()) {
        comparetable.removeChild(comparetable.firstChild);
    }

    for(let level in IDs.findId.lvl){
        let tr = document.createElement("tr");
        
        {let td = document.createElement("td");
        td.innerText=level;
        tr.appendChild(td);}

        {let td = document.createElement("td");
        td.innerText=player1.cats.level[playerdata.category][level]!=-1?player1.cats.level[playerdata.category][level]:"-";
        tr.appendChild(td);}

        {let td = document.createElement("td");
        td.innerText=player2.cats.level[playerdata.category][level]!=-1?player2.cats.level[playerdata.category][level]:"-";
        tr.appendChild(td);}

        {let td = document.createElement("td");
        if(player1.cats.level[playerdata.category][level]==-1||player2.cats.level[playerdata.category][level]==-1){
            td.innerText="-"
            td.setAttribute("data-diff","none");
        }else{
            td.innerText=(player1.cats.level[playerdata.category][level]-player2.cats.level[playerdata.category][level]).toFixed(2);
            Number.parseFloat(td.innerText)<0?td.setAttribute("data-diff","positive"):td.setAttribute("data-diff","negative");
        }
        tr.appendChild(td);}

        comparetable.appendChild(tr);
    }
    {
        let tr = document.createElement("tr");

        {let td = document.createElement("td");
        td.innerText="fullgame";
        tr.appendChild(td);}

        {let td = document.createElement("td");
        td.innerText=player1.cats.fullgame[playerdata.category]!=-1?player1.cats.fullgame[playerdata.category]:"-";
        tr.appendChild(td);}

        {let td = document.createElement("td");
        td.innerText=player2.cats.fullgame[playerdata.category]!=-1?player2.cats.fullgame[playerdata.category]:"-";
        tr.appendChild(td);}

        {let td = document.createElement("td");
        if(player1.cats.fullgame[playerdata.category]==-1||player2.cats.fullgame[playerdata.category]==-1){
            td.innerText="-"
            td.setAttribute("data-diff","none");
        }else{
            td.innerText=(player1.cats.fullgame[playerdata.category]-player2.cats.fullgame[playerdata.category]).toFixed(2);
            Number.parseFloat(td.innerText)<0?td.setAttribute("data-diff","positive"):td.setAttribute("data-diff","negative");
        }
        tr.appendChild(td);}

        comparetable.appendChild(tr);
    }
}