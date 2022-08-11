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
        this.version=1.1;
        this.selcat="any",
        this.cats={
            any:[],
            ae:[],
            gunless:[],
        };
        this.nextUpdate=0;
        this.updateTime=3600000*6;
        this.community={
            any:new Player("community","any"),
            ae:new Player("community","ae"),
            gunless:new Player("community","gunless"),
        }
        this.#checkLocalStorage();
    }

    #copy(karlsonScores){
        if(karlsonScores.version!=this.version){
            if(confirm("Your local data format is outdated. Right now you can only reset it to the default to fix this. Do you want to proceed with that? (Otherwise Errors might arise)")){
                localStorage.setItem("karlsonScores",JSON.stringify(this));
                return;
            }
        }
        this.version=karlsonScores.version;
        this.selcat=karlsonScores.selcat,
        this.cats=karlsonScores.cats
        this.nextUpdate=karlsonScores.nextUpdate;
        this.updateTime=karlsonScores.updateTime;
        this.community=karlsonScores.community;
    }

    #checkLocalStorage(){
        let scores_temp = localStorage.getItem("karlsonScores");
        if(scores_temp==null){
            localStorage.setItem("karlsonScores",JSON.stringify(this));
        }else{
            this.#copy(JSON.parse(scores_temp));
        }
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

    saveKarlsonScores(){
        localStorage.setItem("karlsonScores",JSON.stringify(this));
    }

    hasPlayer(playerName){
        for(let player of this.cats[this.selcat]){
            if(player.name===playerName){
                return true;
            };
        }
        return false
    }

    addPlayer(playerName,callback,error,options={category:this.selcat}){
        if(this.hasPlayer(playerName)){
            error("player already there");
            return;
        };
        let player = new Player(playerName,options.category);
        timeManager.getPlayerData(player.name,data=>{
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

    #calculateScores(player,data,community=timeManager.getCurrentCommunityData()){
        let levelcount = 0;
        let totalleveltimes = 0;
        let missingLevelTime = 0;
        for(let level in data.cats.level[player.category]){
            let leveltime = data.cats.level[player.category][level];
            if(leveltime==-1){
                missingLevelTime+=community.cats.level[player.category][level];
            }else{
                levelcount++;
                totalleveltimes+=leveltime;
            };
        }

        // level score
        if(levelcount!=0){
            player.level =((((this.community[player.category].level-missingLevelTime)/totalleveltimes)*Math.sqrt((levelcount)/11))*100).toFixed(2);
        }else{
            player.level=0;
        }
        
        // fullgame score
        if(data.cats.fullgame[player.category]!=-1){
            player.fullgame=((this.community[player.category].fullgame/data.cats.fullgame[player.category])*100).toFixed(2);
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
        timeManager.getPlayerData(player.name,data=>{
            this.#calculateScores(player,data,community);
            this.#updatePlayerScoresList(community,playerList,callback,num+1);
        },error=>{
            console.log(error);
            if(callback!=null)callback();
        });
    }

    updateScores(callback,error){
        timeManager.getCommunityData(data=>{
            // this completly ignores the possible timeout by the speedrun.com api
            
            //community
            this.#calculateCommunityScores(karlsonScores.community.any,data);
            this.#calculateCommunityScores(karlsonScores.community.ae,data);
            this.#calculateCommunityScores(karlsonScores.community.gunless,data);
            //players
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