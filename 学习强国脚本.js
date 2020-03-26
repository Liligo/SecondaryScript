"ui";
var form = {
    type: "read",
    offset: 0,
    number: 6,
    time: 60,
}
ui.layout(
    <vertical padding="20">
        <text gravity="center" textSize="18sp" textColor="red" textStyle="bold"> 《学习强国》辅助</text>
        <vertical>
	        <text text="任务类型 ："/>
	        <radiogroup id="sel">
	            <radio id="read"  text="阅读文章"></radio>
	            <radio id="video" text="视听学习"></radio>
	        </radiogroup>
        </vertical>
        <vertical>
	        <text text="列表偏移量："/>
	        <input id="offset" w="*" marginLeft="12" padding="12" gravity="left" text="0" inputType="number"/>
        </vertical>
        <vertical>
	        <text text="执行次数(次)："/>
	        <input id="number" w="*" marginLeft="12" padding="12" gravity="left" text="6" inputType="number"/>
        </vertical>
        <vertical>
	        <text text="进入详情等待时间(s)："/>
	        <input id="time" w="*" marginLeft="12" padding="12" gravity="left" text="60" inputType="number"/>
        </vertical>
        <button id="ok" w="*"  text="立即执行"/>
        <button id="stop" w="*"  text="停止所有"/>
    </vertical>
);
ui.stop.click(function(){
    threads.shutDownAll();
    engines.stopAll();
});
//指定确定按钮点击时要执行的动作
ui.ok.click(function(){
    //通过getText()获取输入的内容
    form.offset = ui.offset.getText();
    form.number = ui.number.getText();
    form.time = ui.time.getText();
    if(!form.type){
        toast("请选择任务")
        return;
    }
    if(form.offset<0){
        toast("次数必须大于等于0")
        return;
    }
    if(form.number<=0){
        toast("次数必须大于0")
        return;
    }
    if(form.time<=0){
        toast("等待时间必须大于0")
        return;
    }
    log(form);
    try {
        var curThreads =  threads.start(function(){
            //在新线程执行的代码
            if(form.type ==='read'){
                readTast(form.number,form.time,form.offset);
            } 
            if(form.type ==='video') {
                videoTast(form.number,form.time,form.offset)
            }
            curThreads.interrupt();
            toast("任务执行完毕！");
            exit()
        });
    } catch (error) {
        log(error);
        threads.shutDownAll()
        toast("出现异常,请关闭应用重新执行脚本！");
        exit(); // 有异常退出，结束脚本
    }
});
ui.read.on("check",function(check){
    if(check){
        form.type= "read";
    }
});
ui.video.on("check",function(check){
    if(check){
        form.type= "video";
    }
});

// 视听学习任务
function videoTast(num,delay,offset) {
    app.launchApp("学习强国");
    waitForPackage("cn.xuexi.android");
    sleep(5000);
    toast("视听学习");
    // sleep(10000);
    // 电视台
    className("android.widget.FrameLayout").depth(12).id("home_bottom_tab_button_contact").findOne().click();
    sleep(2000);
    var number = 0;
    // 设置偏移量列表
    var videoListView = className("android.widget.ListView").depth(20).findOnce(2);
    if(videoListView) {
        sleep(2000);
        for(var i = 0; i<=offset;i++){
            videoListView.scrollForward();
            sleep(2000);
        }
    }
    while(number < num){
        var videoListView = className("android.widget.ListView").depth(20).findOnce(2);
        if(videoListView) {
            sleep(2000);
            videoListView.scrollForward();
            if (className("android.widget.ListView").depth(20).findOnce(2)) {
                var list = className("android.widget.ListView").depth(20).findOnce(2).children();
                if (list.length > 0) {
                    var child = className("android.widget.ListView").depth(20).findOnce(2).child(0);
                    if (child !== null) {
                        sleep(1000);
                        var isClick = child.click();
                        log('是否点击成功', isClick);
                        if (isClick) {
                            number = number+1;
                            toast('点击进入详情！');
                            for(var i =1 ; i<=delay; i++){
                                var lastTime = delay - i;
                                var lastnumber = num - number;
                                log(lastTime);
                                if(lastTime%5===0){
                                    toast("正在等待模拟阅读，剩余"+ lastTime +"s，剩余"+ lastnumber+"次");
                                }
                                sleep(1000); // 考虑华为手机默认30会休眠所以用29s
                                if(lastTime <=0){
                                    sleep(1000);
                                    toast('返回！');
                                    back();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

//  阅读文章
function readTast(num,delay,offset) {
    app.launchApp("学习强国");
    waitForPackage("cn.xuexi.android");
    sleep(5000);
    // 学习首页
    className("android.widget.FrameLayout").depth(12).id("home_bottom_tab_button_work").findOne().click();
    sleep(2000);
    // 跳到要闻
    toast("切换到要闻");
    className("android.widget.TextView").text("要闻").depth(16).findOne().parent().click();
    sleep(2000);
    var number = 0;
    // 设置偏移量列表
    var newListView = className("android.widget.ListView").depth(20).findOnce(2);
    if(newListView) {
        for(var i = 0; i<=offset;i++){
            newListView.scrollForward();
            sleep(2000);
        }
    }
    while(number < num){
        var newListView = className("android.widget.ListView").depth(20).findOnce(2);
        if(newListView) {
            sleep(2000);
            newListView.scrollForward();
            if (newListView) {
                var list = className("android.widget.ListView").depth(20).findOnce(2).children();
                if (list.length > 0) {
                    sleep(1000);
                    var card_title = newListView.findOne(className("android.widget.TextView").id("general_card_title_id"));
                    if (card_title && card_title.parent() && card_title.parent().parent()) {
                        var isClick = card_title.parent().parent().click();
                        log('是否点击成功', isClick);
                        if (isClick) {
                            number = number+1;
                            toast('点击进入详情！');
                            for(var i =1 ; i<=delay; i++){
                                var lastTime = delay - i;
                                var lastnumber = num - number;
                                log(lastTime);
                                if(lastTime%5===0){
                                    toast("正在等待模拟阅读，"+ lastTime +"s，剩余"+ lastnumber+"次");
                                }
                                sleep(1000); // 考虑华为手机默认30会休眠所以用29s
                                if(lastTime <=0){
                                    sleep(1000);
                                    toast('返回！');
                                    back();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
