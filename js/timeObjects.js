class LevelHolder{
    constructor(){
        this.tut=null;
        this.sand0=null;
        this.sand1=null;
        this.sand2=null;
        this.esc0=null;
        this.esc1=null;
        this.esc2=null;
        this.esc3=null;
        this.sky0=null;
        this.sky1=null;
        this.sky2=null;
}
}

class TimeHolder{
    constructor(name){
        this.name=name;
        this.lastUpdateTime=0;
        this.cats={
            fullgame:{
                any:null,
                ae:null,
                gunless:null,
            },
            level:{
                any:new LevelHolder(),
                ae:new LevelHolder(),
                gunless:new LevelHolder(),
            }
        }
    }
}

class KarlsonTimes{
    // if a TimeHolder was last updated 5 min ago a update is not needed;
    #timeout=60000*5; 

    constructor(){
        this.version=1;
        this.list=[];
        this.communitytime=new TimeHolder("community");
        this.#checkLocalStorage();
    }

    #copy(karlsonTimes){
        if(karlsonTimes.version!=this.version){
            this.#fixLocalStorage(karlsonTimes);
        }
        this.list=karlsonTimes.list;
        this.communitytime=karlsonTimes.communitytime;
    }

    #fixLocalStorage(karlsonTimes= JSON.parse(localStorage.getItem("karlsonTimes"))){

        for (let p in this) {
            // missing property that the parameter karlsonTimes object doesnt have
            karlsonTimes[p] = karlsonTimes[p]??this[p]; 
        }
        for (let p in karlsonTimes) {
            // property in the parameter karlsonTimes has a different name now or was removed
            if(this[p]==undefined){
                delete karlsonTimes[p];
            }
        }

        karlsonTimes.version=this.version;
        localStorage.setItem("karlsonTimes",JSON.stringify(karlsonTimes));
    }

    #checkLocalStorage(){
        let times_temp = localStorage.getItem("karlsonTimes");
        if(times_temp==null){
            localStorage.setItem("karlsonTimes",JSON.stringify(this));
        }else{
            this.#copy(JSON.parse(times_temp));
        }
    }

    saveKarlsonTimes(){
        localStorage.setItem("karlsonTimes",JSON.stringify(this));
    }

    getPlayerData(PlayerName,callback,error,instant=false){
        let TimeHolder = this.#getTimeHolder(PlayerName);
        if(instant||Date.now()>TimeHolder.lastUpdateTime+this.#timeout){
            this.#fetchPlayerData(TimeHolder,data=>{
                TimeHolder.lastUpdateTime=Date.now();
                callback(data);
            },err=>{
                error(err);
            });
        }else{
            callback(TimeHolder);
        }
    }

    getCommunityData(call,error,instant=false){
        let TimeHolder = this.communitytime;
        if(instant||Date.now()>TimeHolder.lastUpdateTime+this.#timeout){
            this.#fetchCommunityData(data=>{
                TimeHolder.lastUpdateTime=Date.now();
                call(data);
            },err=>{
                error(err);
            });
        }else{
            call(TimeHolder);
        }
    }

    getCurrentCommunityData(){
        return this.communitytime;
    }

    

    #getTimeHolder(PlayerName){
        let timeHolder = this.list.find(t=>t.name===PlayerName);
        if(timeHolder==null){
            timeHolder = new TimeHolder(PlayerName); 
            this.list.push(timeHolder);
        }
        return timeHolder;
    }

    #fetchPlayerData(timeHolder,callback,error){
        fetch("https://www.speedrun.com/api/v1/users/"+timeHolder.name+"/personal-bests?game="+IDs.karlson+"&max=200").then(response => {
            if (!response.ok) {
                error(response.status);
                throw new Error("Request failed with status "+response.status);
            }
            return response.json();
        })
        .then(data=>{

            for(let rundata of data.data){
                let run = rundata.run;
                // sandbox2 all enemies quickfix
                if(run.category===IDs.findId.cat.level.any&&run.level===IDs.findId.lvl.sand2){
                    timeHolder.cats.level.ae.sand2=run.times.primary_t;
                }
                if(run.category===IDs.findId.cat.level.ae&&run.level===IDs.findId.lvl.sand2)continue;
                //
                if(run.level==null){
                    let catName = IDs.findName.cat.full[run.category];
                    if(catName==null)continue;
                    timeHolder.cats.fullgame[catName]=run.times.primary_t;
                }else{
                    let levelCatName = IDs.findName.cat.level[run.category];
                    let levelName = IDs.findName.lvl[run.level];
                    if(levelCatName==null||levelName==null)continue;
                    timeHolder.cats.level[levelCatName][levelName]=run.times.primary_t;
                }
            }

            for(let name in timeHolder.cats.fullgame){
                timeHolder.cats.fullgame[name]=timeHolder.cats.fullgame[name]??-1;
            }
            for(let name in timeHolder.cats.level){
                for(let levelname in timeHolder.cats.level[name]){
                    timeHolder.cats.level[name][levelname]=timeHolder.cats.level[name][levelname]??-1;
                }
            }

            this.saveKarlsonTimes();

            callback(timeHolder);
        })
        .catch(errordata=>error(errordata));
    }

    #fetchCommunityData(callback,error){
        fetch("https://www.speedrun.com/api/v1/games/"+IDs.karlson+"/records?miscellaneous=no&max=200&top=1").then(response => {
            if (!response.ok) {
                error(response.status);
                throw new Error("Request failed with status "+response.status);
            }
            return response.json();
        })
        .then(data=>{

            for(let rundata of data.data){
                
                let run = rundata.runs[0].run;
                // sandbox2 all enemies quickfix
                if(run.category===IDs.findId.cat.level.any&&run.level===IDs.findId.lvl.sand2){
                    this.communitytime.cats.level.ae.sand2=run.times.primary_t;
                }
                if(run.category===IDs.findId.cat.level.ae&&run.level===IDs.findId.lvl.sand2)continue;
                //
                if(run.level==null){
                    let catName = IDs.findName.cat.full[run.category];
                    if(catName==null)continue;
                    this.communitytime.cats.fullgame[catName]=run.times.primary_t;
                }else{
                    let levelCatName = IDs.findName.cat.level[run.category];
                    let levelName = IDs.findName.lvl[run.level];
                    if(levelCatName==null||levelName==null)continue;
                    this.communitytime.cats.level[levelCatName][levelName]=run.times.primary_t;
                }
            }

            this.saveKarlsonTimes();

            callback(this.communitytime);
        })
        .catch(errordata=>error(errordata));
    }

    getLocalStorageSize(){
        return (((localStorage.karlsonTimes.length + localStorage.karlsonTimes.length) * 2) / 1024).toFixed(2) + " KB";
    }

}