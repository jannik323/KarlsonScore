function Snake(fieldsize=10){
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width=300;
    canvas.height=300;
    canvas.style="position:absolute; height:300px; width:300px;background-color:white;top:50%;left:50%;transform: translate(-50%, -50%); border: #666 solid 0.25rem ;";
    scale=canvas.width/fieldsize;
    let ctx = canvas.getContext("2d");
    let snake={body:[],x:randomPos(),y:randomPos(),eaten:2,xv:0,yv:0,}
    let apples = [];
    for(let i = 0;i<3;i++)apples.push({x:randomPos(),y:randomPos()})
    function randomPos(){return Math.floor(Math.random()*fieldsize)}
    addEventListener("keydown",e=>{
        switch(e.key){
            case "w":
                snake.yv=-1;
                snake.xv=0;
                break;
            case "a":
                snake.yv=0;
                snake.xv=-1;
                break;
            case "s":
                snake.yv=1;
                snake.xv=0;
                break;
            case "d":
                snake.yv=0;
                snake.xv=1;
                break;
            case "Escape":
                snake.yv=0;
                snake.xv=0;
                break;
        }
    })
    setInterval(()=>{
        update();
        draw();
    },200);
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#4d834e";
        ctx.fillRect(snake.x*scale,snake.y*scale,scale,scale);
        ctx.fillStyle="#834d4d";
        for(let apple of apples)ctx.fillRect(apple.x*scale,apple.y*scale,scale,scale);
        ctx.fillStyle="#3d733e";
        for(let bod of snake.body)ctx.fillRect(bod.x*scale,bod.y*scale,scale,scale);
    }
    function update(){
        if(snake.xv==0&&snake.yv==0)return;
        if(snake.eaten>snake.body.length)snake.body.push({x:snake.x,y:snake.y})
        if(snake.body.length>0){
            for(let i = snake.body.length-1;i>0;i--){
                snake.body[i].x=snake.body[i-1].x;
                snake.body[i].y=snake.body[i-1].y;
            }
            snake.body[0].x=snake.x;
            snake.body[0].y=snake.y;
        }
        snake.x+=snake.xv;
        snake.y+=snake.yv;
        if(snake.x<0)snake.x=fieldsize-1;
        if(snake.x>=fieldsize)snake.x=0;
        if(snake.y<0)snake.y=fieldsize-1;
        if(snake.y>=fieldsize)snake.y=0;
        for(apple of apples){
            if(apple.x==snake.x&&apple.y==snake.y){
                snake.eaten++;
                do{apple.x=randomPos();apple.y=randomPos();}while(snake.body.some(e=>e.x==apple.x&&e.y==apple.y));
            }
        }
        for(bod of snake.body){
            if(bod.x==snake.x&&bod.y==snake.y){
                snake.body=[],
                snake.eaten=3,
                snake.x=randomPos();
                snake.y=randomPos();
                break;
            }
        }
    }
}