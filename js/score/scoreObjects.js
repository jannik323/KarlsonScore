class Player{
    constructor(name,category){
        this.name=name;
        this.category=category;
        this.fullgame=null;
        this.level=null;
        this.total=null;
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
        this.nextUpdate=Date.now();
        this.updateTime=3600000;
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
        callback();
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

    addPlayer(player,callback,error){
        if(this.hasPlayer(player.name)){
            error("player already there");
            return;
        };
        timeManager.getPlayerData(player.name,data=>{
            this.cats[player.category].push(player);
            this.#calculateScores(player,data);
            this.saveKarlsonScores();
            callback();
        },err=>{
            error(err);
        });
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

    #calculateScores(player,data){
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
    
    #calculateCommunityScores(player,data){
    
        let totalleveltimes = 0;
        for(let time in data.cats.level[player.category]){
            totalleveltimes+=data.cats.level[player.category][time];
        }
        player.level=totalleveltimes.toFixed(2);
        player.fullgame=data.cats.fullgame[player.category].toFixed(2);
        player.total=(totalleveltimes*data.cats.fullgame[player.category]).toFixed(2);
    }
    
    #updatePlayerScoresList(playerlist,num=0){
        if(num>playerlist.length)return;
        let player = playerlist[num];
        if(player==null)return;
    
        timeManager.getPlayerData(player.name,data=>{
            this.#calculateScores(player,data);
            this.#updatePlayerScoresList(playerlist,num+1);
        },error=>{
            console.log(error);
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
            this.#updatePlayerScoresList(karlsonScores.cats.any);
            this.#updatePlayerScoresList(karlsonScores.cats.ae);
            this.#updatePlayerScoresList(karlsonScores.cats.gunless);

            this.saveKarlsonScores();
            this.nextUpdate=Date.now();
            callback();
        },err=>{
            error(err);
        });
    }
}