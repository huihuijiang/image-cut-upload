var policyText = {
	"expiration": "2020-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
	"conditions": [
		["content-length-range", 0, 2 * 1024 * 1024] // 设置上传文件的大小限制
	]
};

accessid = 'your id';
accesskey = 'your key';
host = 'your host';

var activityPic = 'qph_test/activity_image/'; //存放的文件夹

var imgUrl; //图片返回地址
var img_flag = false; //true竖图
var bili; //缩放比
var imgw, imgh; //图片原始尺寸
var path = '';
var img;//剪切显示的大图
var Orientation;//图片的旋转方向
var policyBase64 = Base64.encode(JSON.stringify(policyText))
message = policyBase64;
var bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, {
	asBytes: true
});
var signature = Crypto.util.bytesToBase64(bytes);

function get_suffix(filename) {
	pos = filename.lastIndexOf('.')
	suffix = ''
	if(pos != -1) {
		suffix = filename.substring(pos)
	}
	return suffix;
}

function random_string(len) {
	len = len || 32;
	var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
	var maxPos = chars.length;
	var pwd = '';
	for(i = 0; i < len; i++) {
		pwd += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

function set_upload_param(up, filename) {
	if(filename != '') {
		path = new Date().getTime() + random_string(10) + get_suffix(filename);
		new_multipart_params = {
			'key': 'qph_test/activity_image/' + path,
			'policy': policyBase64,
			'OSSAccessKeyId': accessid,
			'success_action_status': '200', //让服务端返回200,不然，默认会返回204
			'signature': signature,
		};

		up.setOption({
			'url': host,
			'multipart_params': new_multipart_params
		});
	}else{
		
	}

	up.start();
}
var uploader = new plupload.Uploader({
	runtimes: 'html5,flash,silverlight,html4',
	browse_button: 'selectfiles',
	//runtimes : 'flash',
	container: document.getElementById('container'),
	flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
	silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
	url: host,
	// multi_selection:false,//是否可以多文件上传
	multipart_params: {
		// 'Filename': '${filename}',
		'key': 'qph_test/activity_image/' + path,
		'policy': policyBase64,
		'OSSAccessKeyId': accessid,
		'success_action_status': '200', //让服务端返回200,不然，默认会返回204
		'signature': signature,
	},
	unique_names: true,
	init: {
		PostInit: function(e) {
			//document.getElementById('ossfile').innerHTML = '';
			document.getElementById('postfiles').onclick = function() {
				set_upload_param(uploader, '');
				// uploader.start();
				return false;
			};
		},
		BeforeUpload: function(up, file) {
			set_upload_param(up, file.name)
			console.log(file)
		},
		FilesAdded: function(up, files) {
			var length = files.length
			var before_length = document.getElementById('ossfile').getElementsByTagName("img").length;
			var all_length = before_length + length
			//console.log(length,before_length,all_length)
			console.log(files[0])
			var file=files[0]
			if(length > 1) {
				alert("每次只能选择一张图片")
				for(var b = 0; b < length; b++) {
					uploader.files.pop()
				}
				return false
			}

			for(var i = 0; i < length; i++) {
				if(files[i].origSize > 3145728) {
					alert("图片大小不可超过3M，请重新上传")
					for(var b = 0; b < length; b++) {
						uploader.files.pop()
					}
					return false
				}
			}
			if(all_length > 3) {
				alert("最多可以上传3张图片")
				for(var b = 0; b < length; b++) {
					uploader.files.pop()
				}
				return false
			} else if(all_length == 3) {
				//that.isUpload = false
			}
			if(img) {
				img.parentNode.removeChild(img);
			}
			var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式 
		    if (!rFilter.test(file.type)) { 
		      alert("请选择jpeg、png格式的图片", false); 
		      return; 
		    } 
			var reader = new FileReader();
			reader.readAsDataURL(files[0].getNative());
			reader.onload = (function(e) {
				
				//console.log(e.target.exif)
				var image = new Image();
				image.src = e.target.result;
				image.id = "big";
				//image.setAttribute("data-id",files[0].id); // 设置  
				image.onload = function() {
					imgw = this.width;
					imgh = this.height;
					bili = this.width / w;
					img_box.appendChild(image)
					img = document.getElementById("big");
					
					EXIF.getData(image, function() {
			            Orientation = EXIF.getTag(this, 'Orientation');
			        });
			        if(Orientation==6){
						canvas.width = imgh;
						canvas.height = imgw;
						
						//绘制图片
						//旋转角度以弧度值为参数  
						//ctx.translate(imgw/20,imgh/20);//设置画布上的(0,0)位置，也就是旋转的中心点
					    var degree = 1 * 90 * Math.PI / 180; 
					    ctx.rotate(degree);  
					    console.log(img)
					    ctx.drawImage(img, 0, -imgh);
					    //ctx.restore();//恢复状态
					    img.parentNode.removeChild(img);
						img_box.appendChild(convertCanvasToImage(canvas));
						//预览
						var x=imgh;
						imgh=imgw;
						imgw=x;
					}
					img=img_box.getElementsByTagName("img")[0]
					
					
					console.log("w:"+imgw)
					console.log("h:"+imgh)
					
					if(imgw > imgh) {
						img_flag = false;
						img_type = 1;
						bili = imgw / w;
					} else {
						if((imgh * w / imgw) < h) {
							img_flag = true;
							img_type = 2;
							bili = imgw / w;
						} else {
							img_flag = true;
							img_type = 3;
							bili = imgh / h;
						}
					}
					console.log(img_type)
					page1.style.display = "none";
					page2.style.display = "block";
					
					set_page2();//设置显示区
					set_mask();//设置遮罩层
					var obj_div=document.createElement("div")
					var obj_span=document.createElement("span")
					obj_span.id=files[0].id;
					obj_span.setAttribute("class","delete")
					obj_div.appendChild(obj_span)
					ossfile.appendChild(obj_div)
					img.setAttribute("data-id",files[0].id); // 设置 
					
				};
			});

			plupload.each(files, function(file) {
				path = new Date().getTime() + random_string(10) + get_suffix(file.name);
				

			})
		},

		UploadProgress: function(up, file) {
			/*file.process为上传进度*/
		},

		FileUploaded: function(up, file, info) {
			if(info.status >= 200 || info.status < 200) {
				imgUrl = host + '/' + activityPic + path + '?x-oss-process=image/crop,x_' + Math.ceil(position.x) + ',y_' + Math.ceil(position.y) + ',w_' + Math.ceil(position.w) + ',h_' + Math.ceil(position.w)
				//document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'success';
			} else {
				//document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
			}
		},

		Error: function(up, err) {
			document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
		}
	}
});

uploader.init();




function previewImage(file, callback) { //file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
	if(!file || !/image\//.test(file.type)) return; //确保文件是图片
	if(file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
		var fr = new mOxie.FileReader();
		fr.onload = function() {
			callback(fr.result);
			fr.destroy();
			fr = null;
		}
		fr.readAsDataURL(file.getSource());
	} else {
		var preloader = new mOxie.Image();
		preloader.onload = function() {
			//preloader.downsize( 300, 300 );//先压缩一下要预览的图片,宽300，高300
			var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
			callback && callback(imgsrc); //callback传入的参数为预览图片的url
			preloader.destroy();
			preloader = null;
		};
		preloader.load(file.getSource());
	}
}
//window.onload
function getStyle(el, name) {
	if(window.getComputedStyle) {
		return window.getComputedStyle(el, null);
	} else {
		return el.currentStyle;
	}
}

function set_mask() {
	if(img_flag) { //竖向
		masks[0].style.width = "100%";
		masks[1].style.width = "100%";
		masks[0].style.height = show.offsetTop + "px";

		masks[1].style.height = ((imgh / bili) - show.offsetTop - show.offsetWidth) + "px";
		masks[1].style.right = 'auto';
		masks[1].style.top = 'auto';
		masks[1].style.bottom = 0;
		masks[1].style.left = 0;
		//masks[1].style.top=(show.offsetWidth)+"px";;
	} else {
		masks[0].style.height = "100%";
		masks[1].style.height = "100%";
		masks[0].style.width = show.offsetLeft + "px";
		masks[1].style.width = (w - show.offsetLeft - (imgh / bili)) + "px";
		masks[1].style.top = 0;
		masks[1].style.right = 0;
		masks[1].style.left = 'auto';
		masks[1].style.bottom = 'auto';
	}

}

function set_page2() {
	if(img_type == 3) { //竖图
		img_box.style.height = "100%";
		img_box.style.width = (imgw / bili) + "px";
		img.style.height = "100%";
		show.style.width = (imgw / bili) + "px";
		show.style.height = (imgw / bili) + "px";
		show.style.left = 0;
		show.style.top = 0;
		show_l = imgw / bili;
		position = {
			"x": 0,
			'y': 0,
			'w': (imgw)
		}
	} else if(img_type == 1) { //横图
		img.style.width = "100%";
		img_box.style.width = "100%";
		img_box.style.height = (imgh / bili) + "px";
		show.style.height = (imgh / bili) + "px";
		show.style.width = (imgh / bili) + "px";
		show.style.left = 0;
		show.style.top = 0;
		show_l = imgh / bili;
		position = {
			"x": 0,
			'y': 0,
			'w': (imgh)
		}
	} else if(img_type == 2) { //竖图
		img.style.width = "100%";
		img_box.style.width = "100%";
		img_box.style.height = (imgh / bili) + "px";
		show.style.height = w + "px";
		show.style.width = w + "px";
		show.style.left = 0;
		show.style.top = 0;
		show_l = w;
		position = {
			"x": 0,
			'y': 0,
			'w': (imgw)
		}
	}
}
function convertCanvasToImage(canvas) {
			var image = new Image();
			image.src = canvas.toDataURL("image/png");
			return image;
		}