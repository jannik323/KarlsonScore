let karlsonScores = new KarlsonScores();

refresh.value=karlsonScores.updateTime/60000;

function deleteAllData(){
    if(confirm("Do you really want to delete all your data?"))
    localStorage.removeItem("karlsonScores");
    localStorage.removeItem("karlsonTimes");
    location.reload();
}

function changeRefreshTime(self){
   karlsonScores.updateTime=self.value*60000;
   karlsonScores.saveKarlsonScores();
}

function checkinput(self){
    if(self.value<=0){
        self.value=1;
    }else if(self.value>42069){
        self.value=42069;
    }
}
