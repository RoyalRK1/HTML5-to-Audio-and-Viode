 //添加音乐按钮
 $(".add-audio").on('click', function() {
    //将点击本地音乐按钮，定义为点击上传文件的按钮
	$('.audio-file').click();
});

 // //点击导入按钮,使files触发点击事件,然后完成读取文件的操作
 // $("#fileImport").click(function() {
 //     $("#files").click();
 // })
 var audio=[];
 //如果用户选取了自己的音乐则通过filereader读取
 $('.audio-file').on('change', function(e) {
     for (var i = 0; i < e.target.files.length; i++) {

         var file = document.getElementById('file').files[i];

         var url = URL.createObjectURL(file);
         var mediaFile = e.target.files[i].name;
         audio.push({'name':mediaFile,'url':url})
     }
     var html = "";
     for ( i = 0; i < audio.length; i++) {
         html += '<li>' + audio[i].name +'</li>';
     }
     $("audio")[0].src= audio[0].url
     $(".audio-list").html(html);
 });
 //点击导入按钮,使files触发点击事件,然后完成读取文件的操作
 $("#fileImport").click(function() {
     $("#files").click();
 })
 //播放与暂停时唱片上的指针的位置
 function pauseFunction(){
			$('#needle').removeClass("resume-needle").addClass("pause-needle");
}
function playFunction(){
			$('#needle').removeClass("pause-needle").addClass("resume-needle");
}


 function fileImport() {
     //获取读取我文件的File对象
     var selectedFile = document.getElementById('files').files[0];
     var name = selectedFile.name; //读取选中文件的文件名
     var size = selectedFile.size; //读取选中文件的大小
     // console.log("文件名:" + name + "大小:" + size);
     var reader = new FileReader(); //这是核心,读取操作就是由它完成.
     reader.readAsText(selectedFile,"gb2312"); //读取文件的内容,也可以读取文件的URL
     reader.onload = function qq() {
         //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
         // console.log(this.result);
         var text1 = this.result;
         // console.log(text);
         $(function() {
             // console.log(text);
             function parseLyric(text) {
                 //按行分割歌词
                 let lyricArr = text.split('\n');
                 // console.log(lyricArr)//0: "[ti:七里香]" "[ar:周杰伦]"...
                 let result = []; //新建一个数组存放最后结果
                 //遍历分割后的歌词数组，将格式化后的时间节点，歌词填充到result数组
                 for (i = 0; i < lyricArr.length; i++) {
                     let playTimeArr = lyricArr[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g); //正则匹配播放时间
                     let lineLyric = "";
                     if (lyricArr[i].split(playTimeArr).length > 0) {
                         lineLyric = lyricArr[i].split(playTimeArr);
                     }

                     if (playTimeArr != null) {
                         for (let j = 0; j < playTimeArr.length; j++) {
                             //substring(a.b)提取a到b-1之间的字符串,split(":")是按：分割字符串为字符数组
                             let time = playTimeArr[j].substring(1, playTimeArr[j].indexOf("]")).split(":");
                             //数组填充。将时间和内容整合
                             result.push({
                                 time: (parseInt(time[0]) * 60 + parseFloat(time[1])).toFixed(4),
                                 content: String(lineLyric).substr(1)
                             });
                         }
                     }


                 }
                 return result;
             }

             // 这里请按照格式放入相应歌词--开始
             // 格式可能看着很复杂,其实是根据lrc歌词文件换句前加入\n 换行符,然后删除多余空行.即可!
             let text = text1;
             // console.log(text);
             // 这里请按照格式放入相应歌词--结束
             let audio = document.querySelector('audio');

             let result = parseLyric(text); //执行lyc解析


             // 把生成的数据显示到界面上去
             let $ul = $("<ul></ul>");
             for (let i = 0; i < result.length; i++) {
                 let $li = $("<li></li>").text(result[i].content);
                 $ul.append($li);
             }
             $(".bg").append($ul);

             let lineNo = 0; // 当前行歌词
             let preLine =2; // 当播放6行后开始滚动歌词
             let lineHeight = -30; // 每次滚动的距离

             // 滚动播放 歌词高亮  增加类名active
             function highLight() {
                 let $li = $("li");
                 $li.eq(lineNo).addClass("active").siblings().removeClass("active");
                 if (lineNo > preLine) {
                     $ul.stop(true, true).animate({ top: (lineNo - preLine) * lineHeight });
                 }
             }

             highLight();

             // 播放的时候不断渲染
             audio.addEventListener("timeupdate", function() {
                 if (lineNo == result.length) return;
                 if ($("li").eq(0).hasClass("active")) {
                     $("ul").css("top", "0");
                 }
                 lineNo =getLineNo(audio.currentTime);
                 highLight();
                 lineNo++;
             });

             // 当快进或者倒退的时候，找到最近的后面那个result[i].time
             function getLineNo(currentTime) {
                 if (currentTime >= parseFloat(result[lineNo].time)) {
                     // 快进
                     for (let i = result.length - 1; i >= lineNo; i--) {
                         if (currentTime >= parseFloat(result[i].time)) {
                             return i+2;
                         }
                     }
                 } else {
                     // 后退
                     for (let i = 0; i <= lineNo; i++) {
                         if (currentTime <= parseFloat(result[i].time)) {
                             return i+1;
                         }
                     }
                 }
             }

             //播放结束自动回到开头
             audio.addEventListener("ended", function() {
                 // text = [];
                 lineNo = 0;
                 highLight();
                 // audio.play();
                 $(".bg").html('');
                 $("ul").css("top", "0");
             });
         });
     }


 }


 //将添加的视频文件在视频列表中显示出来
 $(".audio-list").on("click", "li", function() {
         //定义在列表里点击的音乐为索引
     var index = $(".audio-list li").index($(this));
     $("audio")[0].src= audio[index].url
     $("audio")[0].play()
     $(".bg").html('');
	 	//点击列表歌曲时修改指针位置
	$('#needle').removeClass("pause-needle").addClass("resume-needle")

 });

 fileImport();






