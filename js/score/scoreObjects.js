class Player{
    constructor(name,category){
        this.name=name;
        this.category=category;
        this.fullgame=null;
        this.level=null;
        this.total=null;
    }
}

class Counter{
    count=0;
    counted;
    constructor(counted){
        this.counted=counted;
    }
    countUp(){
        this.count++;
        this.counted();
    }
}

class KarlsonScores{

    constructor(){
        this.version=1.2;
        this.selcat="any",
        this.cats={
            any:[],
            ae:[],
            gunless:[],
        };
        this.nextUpdate=0;
        this.updateTime=3600000*6;
        this.#checkLocalStorage();
    }

    #copy(karlsonScores){

        if(karlsonScores.version!=this.version){
            this.#fixLocalStorage(karlsonScores);
        }

        this.selcat=karlsonScores.selcat,
        this.cats=karlsonScores.cats
        this.nextUpdate=karlsonScores.nextUpdate;
        this.updateTime=karlsonScores.updateTime;
    }

    #checkLocalStorage(){
        let karlsonScores = localStorage.getItem("karlsonScores");
        if(karlsonScores==null){
            localStorage.setItem("karlsonScores",JSON.stringify(this));
        }else{
            this.#copy(JSON.parse(karlsonScores));
        }
    }

    #fixLocalStorage(karlsonScores= localStorage.getItem("karlsonScores")){

        for (let p in this) {
            // missing property that the parameter karlsonScores object doesnt have
            karlsonScores[p] = karlsonScores[p]??this[p]; 
        }
        for (let p in karlsonScores) {
            // property in the parameter karlsonScores has a different name now or was removed
            if(this[p]==undefined){
                delete karlsonScores[p];
            }
        }

        karlsonScores.version=this.version;
        localStorage.setItem("karlsonScores",JSON.stringify(karlsonScores));
    }

    saveKarlsonScores(){
        localStorage.setItem("karlsonScores",JSON.stringify(this));
    }

    startUpdateCheck(callback){
        this.#updateCheck(callback)
        setInterval(()=>this.#updateCheck(callback),1000);
    }

    #updateCheck(callback){
        if(Date.now()>=this.nextUpdate+this.updateTime)callback();
    }

    // ฅ^•ﻌ•^ฅ //
    changeSelCat(cat){ 
        this.selcat=cat;
        this.saveKarlsonScores();
    }

    hasPlayer(playerName){
        for(let player of this.cats[this.selcat]){
            if(player.name===playerName){
                return true;
            };
        }
        return false;
    }

    addPlayer(playerName,callback,error,options={category:this.selcat}){
        if(this.hasPlayer(playerName)){
            error("player already there");
            return;
        };
        let player = new Player(playerName,options.category);
        karlsonTimes.getPlayerData(player.name,data=>{
            this.cats[player.category].push(player);
            this.#calculateScores(player,data);
            this.saveKarlsonScores();
            callback();
        },err=>{
            error(err);
        });
    }

    addPlayerList(playerList,callback=null,options={category:this.selcat,counter:null},num=0){
        if(num>=playerList.length){
            if(callback!=null)callback();
            return;
        }
        let player = playerList[num];
        if(player==null){
            if(callback!=null)callback();
            return;
        }
        this.addPlayer(player,()=>{
            this.addPlayerList(playerList,callback,options,num+1);
            if(options.counter!=null){
                options.counter.countUp();
            }
        },error=>{
            console.error(error);
            this.addPlayerList(playerList,callback,options,num+1);
            if(options.counter!=null){
                options.counter.countUp();
            }
        });
    }

    addTopPlayers(top,callback,error,options={category:this.selcat,counter:null}){

        fetch("https://www.speedrun.com/api/v1/leaderboards/"+IDs.karlson+"/category/"+IDs.findId.cat.full[options.category]+"?top="+top+"&embed=players").then(response=>{
            if (!response.ok) {
                error(response.status);
                throw new Error("Request failed with status "+response.status);
            }
            return response.json();
        })
        .then(data=>{
            this.addPlayerList(data.data.players.data.map(e=>e.names.international),callback,{category:options.category,counter:options.counter});
        })
        .catch(errordata=>error(errordata));
    }

    removePlayer(playerName,selcat=this.selcat){
        let i = this.cats[selcat].findIndex(e=>e.name==playerName);
        if(i!=-1){
            this.cats[selcat].splice(i,1);
        }else{
            return false;
        }
        this.saveKarlsonScores();
        return true;
    }

    #calculateScores(player,data,community=karlsonTimes.getCurrentCommunityData()){
        let levelcount = 0;
        let SoB = 0;
        let comSoB = 0;
        for(let level in data.cats.level[player.category]){
            let leveltime = data.cats.level[player.category][level];
            if(leveltime!=-1){
                levelcount++;
                SoB+=leveltime;
                comSoB+=community.cats.level[player.category][level];
            };
        }

        // level score
        if(levelcount!=0){
            player.level =(((comSoB/SoB)*Math.sqrt((levelcount)/11))*100).toFixed(2);
        }else{
            player.level=0;
        }
        
        // fullgame score
        if(data.cats.fullgame[player.category]!=-1){
            player.fullgame=((community.cats.fullgame[player.category]/data.cats.fullgame[player.category])*100).toFixed(2);
        }else{
            player.fullgame=0;
        }
    
        //total score
        player.total=(((player.fullgame*1)+(player.level*1))/2).toFixed(2);
    
    }
    
    // not rly the scores.... just the sob and fullgame time lol
    // this could honestly be removed at this point
    #calculateCommunityScores(player,data){
    
        let totalleveltimes = 0;
        for(let time in data.cats.level[player.category]){
            totalleveltimes+=data.cats.level[player.category][time];
        }
        player.level=totalleveltimes.toFixed(2);
        player.fullgame=data.cats.fullgame[player.category].toFixed(2);
        player.total=(totalleveltimes*data.cats.fullgame[player.category]).toFixed(2);
    }
    
    #updatePlayerScoresList(community,playerList,callback=null,num=0){
        if(num>=playerList.length){
            if(callback!=null)callback();
            return;
        }
        let player = playerList[num];
        if(player==null){
            if(callback!=null)callback();
            return;
        }
        karlsonTimes.getPlayerData(player.name,data=>{
            this.#calculateScores(player,data,community);
            this.#updatePlayerScoresList(community,playerList,callback,num+1);
        },error=>{
            console.log(error);
            if(callback!=null)callback();
        });
    }

    updateScores(callback,error){
        karlsonTimes.getCommunityData(data=>{
            // this completly ignores the possible timeout by the speedrun.com api

            this.#updatePlayerScoresList(data,karlsonScores.cats.any,
                ()=>this.#updatePlayerScoresList(data,karlsonScores.cats.ae,
                    ()=>this.#updatePlayerScoresList(data,karlsonScores.cats.gunless,
                        ()=>{
                            this.saveKarlsonScores();
                            this.nextUpdate=Date.now();
                            callback();
                        }
            )));
        },err=>{
            error(err);
        });
    }

    getLocalStorageSize(){
        return (((localStorage.karlsonScores.length + localStorage.karlsonScores.length) * 2) / 1024).toFixed(2) + " KB";
    }
}