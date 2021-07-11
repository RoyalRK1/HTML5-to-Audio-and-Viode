 //添加视频按钮
 $(".add-audio").on('click', function() {
    //将点击添加视频按钮，定义为点击上传文件的按钮
	$('.audio-file').click();
});

var audio=[];
//如果用户选取了自己的视频则通过filereader读取
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

//将添加的视频文件在视频列表中显示出来
$(".audio-list").on("click", "li", function() {
    //定义在列表里点击的视频为索引
    var index = $(".audio-list li").index($(this));
     $("audio")[0].src= audio[index].url
     $("audio")[0].play()
});

