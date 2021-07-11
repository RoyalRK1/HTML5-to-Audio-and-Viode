(function() {
	/* eslint-disable */ //用来处理空格与制表符混合错误
//	document.getElementById();这句话的意思是根据id来获取指定id的控件对象
  var canvas = document.getElementById("cas");//获取画布对象
  var ctx = canvas.getContext("2d");//定义画布类型为2d
  var outcanvas = document.createElement("canvas");
  outcanvas.width = canvas.width;
  outcanvas.height = canvas.height / 2;
  var octx = outcanvas.getContext('2d');

  // audioSource 为音频源，bufferSource为buffer缓冲源
  var audioSource, bufferSource;

  //实例化音频对象
  var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

  if (!AudioContext) {
    alert("您的浏览器不支持audio API，请更换浏览器（chrome、firefox）再尝试")
    return;
  }

  var AC = new AudioContext();

  const streamNode = AC.createMediaStreamDestination();
  const audioElem = new Audio();
  audioElem.controls = true;
  document.body.appendChild(audioElem);
  audioElem.srcObject = streamNode.stream;

  // analyser为analysernode，具有频率的数据，用于创建数据可视化
  var analyser = AC.createAnalyser();

  // gain为gainNode，音频的声音处理模块
  var gainnode = AC.createGain();
  gainnode.gain.value = 1;

  //计时器
  var RAF = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  //播放音乐
  var audio = $(".music-player")[0];
	//jquery.js 中将 jquery 变量赋值给了 ＄ 符号，通过$来调用JQuery库。
  
	//定义一个音乐的播放空间
	var musics = [{
    name: "稻香",
    src: "music.mp3"
  }];
  var nowIndex = 0;   //当前正在播放的音乐索引
  var singleLoop = false; //是否单曲循环

  var app = {	  //初始化
    init: function() {
      this.render(musics);//提供音乐内存提供

      this.bind();//一个音乐播放结束事件

      this.trigger(0);//触发
    },

    bind: function() {
      var that = this;
		//当音频播放结束时触发
      audio.onended = function() {	  
		  //被选择的元素要触发的事件，循环播放还是播放下一首
        app.trigger(singleLoop ? nowIndex : (nowIndex + 1));
      };

		//单曲/列表循环的点击事件
      $(".play-type").on("click", function() {
        singleLoop = !singleLoop;
		  //点击后，在页面上切换单曲/列表循环的显示
        $(this).html(singleLoop ? "列表循环" : "单曲循环");
      });

      //静音按钮
      $(".muti").on('click', function() {
        var ismuti = !!gainnode.gain.value;
        gainnode.gain.value = ismuti ? 0 : 1;
        $(this).html(ismuti ? "取消静音" : "静音");
      });
			
      //添加音乐按钮
		$(".add-music").on('click', function() {
			//将点击添加音乐按钮，定义为点击上传文件的按钮
        $('.music-file').click();
      });

      var index=0;
		//将添加的音乐文件在音乐列表中显示出来
      $(".music-list").on("click", "li", function() {
		  //定义在列表里点击的音乐为索引
        index = $(".music-list li").index($(this));
        that.trigger(index);//对索引进行调用触发
      });

      $(".music-player")[0].addEventListener("pause", function () {   // 暂停时会触发，当播放完一首歌曲时也会触发
        that.trigger(index,1);//对索引进行调用触发
      })

      //如果用户选取了自己的音乐则通过filereader读取
      $('.music-file').on('change', function() {
        if (this.files.length == 0) return;

        var files = Array.prototype.slice.call(this.files);

        files.forEach(function(file) {
          var fr = new FileReader();
          fr.readAsArrayBuffer(file);
          var mdata = {
            name: file.name.substring(0, file.name.lastIndexOf('.')),
            buffer: null,
            decoding: true
          };

          musics.push(mdata);

          fr.onload = function(i) {
            decodeBuffer(i.target.result, function(buffer) {
              mdata.buffer = buffer;
              mdata.decoding = false;
              $(".music-list li").eq(musics.indexOf(mdata)).html(mdata.name);
            })
          };
        });

        that.render(musics);
      });
    },

    trigger: function(index,status) {
		//如果索引长度大于音乐播放缓存区的长度，则执行第一个，否则执行第二个
      index = index >= musics.length ? 0 : index;

      if (musics[index].decoding)return;
      
      if(status==1){
        this.stop();
        return
      }else{
        this.stop();
      }
      

      nowIndex = index;//把索引的音乐给到当前播放
		
		//获取列表播放
      $(".music-list li").eq(index).addClass("playing").siblings().removeClass("playing");

		//获取点击歌曲的播放资源
      if (musics[index].src) {
        chooseMusic(musics[index].src);
      } 
		else if (musics[index].buffer) {
        playMusic(musics[index].buffer,status);
      }
    },

    stop: function() {
		//GainNode接口提供音量控制.
      var ismuti = !!gainnode.gain.value;

		//静音
      if (!ismuti) {
        gainnode.gain.value = 0;
      }

		//音乐暂停
      if (!audio.ended || !audio.paused) 
		  audio.pause();

      if (bufferSource && ('stop' in bufferSource)) 
      bufferSource.stop();

      try {//try catch用来捕获错误，未定义也能运行
        if (bufferSource) {
          bufferSource.disconnect(analyser);
          bufferSource.disconnect(AC.destination);
        }

        if (audioSource) {
          audioSource.disconnect(analyser);
          audioSource.disconnect(AC.destination);
        }
      } catch (e) {//用来捕捉错误
      }

      if (!ismuti) {
        gainnode.gain.value = 1;
      }
    },

    render: function(musics) {
      var html = "";
      var music;
      for (var i = 0; i < musics.length; i++) {
        music = musics[i];
        html += '<li title="' + music.name + '">' + (music.decoding ? "解码中..." : music.name) + '</li>';
      }
      $(".music-list").html(html);
      $(".music-list li").eq(nowIndex).addClass("playing");
    }
  };

  //选择audio作为播放源
  function chooseMusic(src) {
    audio.src = src;
    audio.load();
   playMusic(audio);
  }

  //对音频buffer进行解码
  function decodeBuffer(arraybuffer, callback) {
    AC.decodeAudioData(arraybuffer, function(buffer) {
      callback(buffer);
    }, function(e) {
      alert("文件解码失败")
    })
  }

  //音频播放
  var that = this
  function playMusic(arg) {
    var source;
    //如果arg是audio的dom对象，则转为相应的源
    if (arg.nodeType) {
      audioSource = audioSource || AC.createMediaElementSource(arg);
      source = audioSource;
    } else {
      bufferSource = AC.createBufferSource();

      bufferSource.buffer = arg;

      bufferSource.onended = function() {
        app.trigger(singleLoop ? nowIndex : (nowIndex + 1));
      };

      //播放音频
      setTimeout(function() {
        bufferSource.start()
//        audio.play()
      }, 0);

      source = bufferSource;
    }

    //连接analyserNode
    source.connect(analyser);

    //再连接到gainNode
    analyser.connect(gainnode);

    //最终输出到音频播放器
    gainnode.connect(AC.destination);
  }

  //绘制音谱的参数
  var rt_array = [],	//用于存储柱形条对象
    rt_length = 30;		//规定有多少个柱形条

  var grd = ctx.createLinearGradient(0, 110, 0, 270);
  grd.addColorStop(0, "red");
  grd.addColorStop(0.3, "yellow");
  grd.addColorStop(1, "#00E800");

  function showTxt(msg) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px 微软雅黑";
    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }

  //动画初始化，获取analyserNode里的音频buffer
  function initAnimation() {
    //每个柱形条的宽度，及柱形条宽度+间隔
    var aw = canvas.width / rt_length;
    var w = aw - 5;

    for (var i = 0; i < rt_length; i++) {
      rt_array.push(new Retangle(w, 5, i * aw, canvas.height / 2))
    }

    animate();
  }

  function animate() {
    if (!musics[nowIndex].decoding) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      octx.clearRect(0, 0, canvas.width, canvas.height);

      //出来的数组为8bit整型数组，即值为0~256，整个数组长度为1024，即会有1024个频率，只需要取部分进行显示
      var array_length = analyser.frequencyBinCount;
      var array = new Uint8Array(array_length);
      analyser.getByteFrequencyData(array);	//将音频节点的数据拷贝到Uin8Array中

      //数组长度与画布宽度比例
      var bili = array_length / canvas.width;

      for (var i = 0; i < rt_array.length; i++) {
        var rt = rt_array[i];
        //根据比例计算应该获取第几个频率值，并且缓存起来减少计算
        rt.index = ('index' in rt) ? rt.index : ~~(rt.x * bili);
        rt.update(array[rt.index]);
      }

      draw();
    } else {
      showTxt("音频解码中...")
    }

    RAF(animate);
  }

  //制造半透明投影
  function draw() {
    ctx.drawImage(outcanvas, 0, 0);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI);
    ctx.scale(-1, 1);
    ctx.drawImage(outcanvas, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
    ctx.fillStyle = 'rgba(0, 0, 0, .8)';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
  }

  // 音谱条对象
  function Retangle(w, h, x, y) {
    this.w = w;
    this.h = h; // 小红块高度
    this.x = x;
    this.y = y;
    this.jg = 3;
    this.power = 0;
    this.dy = y; // 小红块位置
    this.num = 0;
  }

  var Rp = Retangle.prototype;

  Rp.update = function(power) {
    this.power = power;
    this.num = ~~(this.power / this.h + 0.5);

    //更新小红块的位置，如果音频条长度高于红块位置，则红块位置则为音频条高度，否则让小红块下降
    var nh = this.dy + this.h;//小红块当前位置
    if (this.power >= this.y - nh) {
      this.dy = this.y - this.power - this.h - (this.power == 0 ? 0 : 1);
    } else if (nh > this.y) {
      this.dy = this.y - this.h;
    } else {
      this.dy += 1;
    }

    this.draw();
  };

  Rp.draw = function() {
    octx.fillStyle = grd;
    var h = (~~(this.power / (this.h + this.jg))) * (this.h + this.jg);
    octx.fillRect(this.x, this.y - h, this.w, h);
    for (var i = 0; i < this.num; i++) {
      var y = this.y - i * (this.h + this.jg);
      octx.clearRect(this.x - 1, y, this.w + 2, this.jg);
    }
    octx.fillStyle = "#950000";
    octx.fillRect(this.x, ~~this.dy, this.w, this.h);
  };

  app.init();
  initAnimation();
}()
);
