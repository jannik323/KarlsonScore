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

class TimeManager{
    #times;
    timeout=60000; 
    // if a TimeHolder was last updated 1 min ago a update is not needed;
    constructor(){
        this.#checkLocalStorage();
    }

    getPlayerData(PlayerName,callback,error,instant=false){
        let TimeHolder = this.#getTimeHolder(PlayerName);
        if(instant||Date.now()>TimeHolder.lastUpdateTime+this.timeout){
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
        let TimeHolder = this.#times.communitytime;
        if(instant||Date.now()>TimeHolder.lastUpdateTime+this.timeout){
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

    #checkLocalStorage(){
        let times_temp = localStorage.getItem("karlsonTimes");
        if(times_temp==null){
            times_temp = {
                version:1,
                list:[],
                communitytime:new TimeHolder("community"),
            };
            this.#times=times_temp;
            localStorage.setItem("karlsonTimes",JSON.stringify(this.#times));
        }else{
            this.#times=JSON.parse(times_temp);
        }
    }

    #getTimeHolder(PlayerName){
        let timeHolder = this.#times.list.find(t=>t.name===PlayerName);
        if(timeHolder==null){
            timeHolder = new TimeHolder(PlayerName); 
            this.#times.list.push(timeHolder);
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
                    timeHolder.cats.fullgame[IDs.findName.cat.full[run.category]]=run.times.primary_t;
                }else{
                    timeHolder.cats.level[IDs.findName.cat.level[run.category]][IDs.findName.lvl[run.level]]=run.times.primary_t;
                }
            }

            localStorage.setItem("karlsonTimes",JSON.stringify(this.#times));

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
                    this.#times.communitytime.cats.level.ae.sand2=run.times.primary_t;
                }
                if(run.category===IDs.findId.cat.level.ae&&run.level===IDs.findId.lvl.sand2)continue;
                //
                if(run.level==null){
                    let catName = IDs.findName.cat.full[run.category];
                    if(catName==null)continue;
                    this.#times.communitytime.cats.fullgame[catName]=run.times.primary_t;
                }else{
                    let levelCatName = IDs.findName.cat.level[run.category];
                    let levelName = IDs.findName.lvl[run.level];
                    if(levelCatName==null||levelName==null)continue;
                    this.#times.communitytime.cats.level[levelCatName][levelName]=run.times.primary_t;
                }
            }

            localStorage.setItem("karlsonTimes",JSON.stringify(this.#times));

            callback(this.#times.communitytime);
        })
        .catch(errordata=>error(errordata));
    }

}