 //添加音乐按钮
 $(".add-audio").on('click', function() {
    //将点击本地音乐按钮，定义为点击上传文件的按钮
	$('.audio-file').click();
});

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
//将添加的音乐文件在音乐列表中显示出来

$(".audio-list").on("click", "li", function() {
    //定义在列表里点击的音乐为索引
	var index = $(".audio-list li").index($(this));
     $("audio")[0].src= audio[index].url
     $("audio")[0].play()
	//点击列表歌曲时修改指针位置
	$('#needle').removeClass("pause-needle").addClass("resume-needle")

});

//播放与暂停时唱片上的指针的位置
function pauseFunction(){
			$('#needle').removeClass("resume-needle").addClass("pause-needle");
}
function playFunction(){
			$('#needle').removeClass("pause-needle").addClass("resume-needle");
}
				