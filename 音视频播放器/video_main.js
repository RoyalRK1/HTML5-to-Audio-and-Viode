 //添加视频按钮
 $(".add-video").on('click', function() {
    //将点击添加视频按钮，定义为点击上传文件的按钮
	$('.video-file').click();
});

var video=[];
//如果用户选取了自己的视频则通过filereader读取
$('.video-file').on('change', function(e) {
    for (var i = 0; i < e.target.files.length; i++) {
        
        var file = document.getElementById('file').files[i]; 
        //获取选择文件的地址与名字
        var url = URL.createObjectURL(file);
        var mediaFile = e.target.files[i].name;
		//将选择的文件的名字与地址整合存储
        video.push({'name':mediaFile,'url':url})
    }
	//将添加的视频文件在视频列表中显示出来
    var html = "";
    for (var i = 0; i < video.length; i++) {
        html += '<li>' + video[i].name +'</li>';
    }
    $("video")[0].src= video[0].url//地址传递
    $(".video-list").html(html);
});


$(".video-list").on("click", "li", function() {
    //定义在列表里点击的视频为索引
    var index = $(".video-list li").index($(this));
     $("video")[0].src= video[index].url
     $("video")[0].play()//播放
});